import csv
import logging
from decimal import Decimal
from io import StringIO

from django.db import transaction
from django.utils import timezone
from rest_framework import status

from pharmacies.models import Product
from pharmacies.services.google_sheet import GoogleSheetAccessError, fetch_google_sheet_csv
from pharmacies.services.product_sync import (
    CSV_COLUMN_ALIASES,
    REQUIRED_UPLOAD_COLUMNS,
    REQUIRED_UPLOAD_COLUMN_LABELS,
    SHEET_SYNC_INTERVAL_SECONDS,
    _coerce_price_decimal,
    _coerce_stock_integer,
    _maybe_push_to_google_sheet,
    _normalize_column_token,
    _normalize_image_url,
)

logger = logging.getLogger(__name__)


def resolve_upload_column(raw_key: str) -> str | None:
    token = _normalize_column_token(raw_key)
    return CSV_COLUMN_ALIASES.get(token)


def normalize_uploaded_row(raw_row, row_number):
    cleaned = {}
    original_data = {}

    for key, value in (raw_row or {}).items():
        raw_key = str(key).strip() if key is not None else ''
        raw_value = str(value).strip() if value is not None else ''

        if raw_key:
            original_data[raw_key] = raw_value

        canonical_key = resolve_upload_column(raw_key)
        if not canonical_key:
            continue

        existing_value = cleaned.get(canonical_key, '')
        if raw_value or not existing_value:
            cleaned[canonical_key] = raw_value

    errors = []
    name = cleaned.get('name', '').strip()
    if not name:
        errors.append('product name is required')

    category = cleaned.get('category', '').strip() or 'General'
    description = cleaned.get('description', '').strip()

    price_value = cleaned.get('price', '').strip()
    try:
        price = _coerce_price_decimal(price_value)
    except ValueError as exc:
        errors.append(str(exc))
        price = Decimal('0')

    stock_raw = cleaned.get('stock', '').strip()
    try:
        stock = _coerce_stock_integer(stock_raw)
    except ValueError as exc:
        errors.append(str(exc))
        stock = 0

    image_url = _normalize_image_url(cleaned.get('image_url', ''))

    if errors:
        return None, {
            'row': row_number,
            'errors': errors,
            'data': original_data,
        }

    return {
        'name': name,
        'category': category,
        'description': description,
        'price': price,
        'stock': stock,
        'image_url': image_url,
        '__row_number': row_number,
        '__raw_data': original_data,
    }, None


def parse_csv_content(decoded_content):
    if not decoded_content.strip():
        return [], [
            {
                'row': 1,
                'errors': ['CSV file is empty.'],
                'data': {},
            }
        ]

    try:
        dialect = csv.Sniffer().sniff(decoded_content[:2048], delimiters=',;\t|')
    except csv.Error:
        dialect = csv.excel

    reader = csv.DictReader(StringIO(decoded_content), dialect=dialect)

    source_headers = [str(field).strip() for field in (reader.fieldnames or []) if field]
    canonical_headers = {
        resolved
        for resolved in (resolve_upload_column(field) for field in source_headers)
        if resolved
    }

    missing = sorted(REQUIRED_UPLOAD_COLUMNS - canonical_headers)
    if missing:
        missing_labels = [REQUIRED_UPLOAD_COLUMN_LABELS[column] for column in missing]
        return [], [
            {
                'row': 1,
                'errors': [f"Missing required columns: {', '.join(missing_labels)}"],
                'data': {'headers': source_headers},
            }
        ]

    valid_rows = []
    failed_rows = []

    for row_index, row in enumerate(reader, start=2):
        if not any(str(value).strip() for value in (row or {}).values()):
            continue

        normalized, error = normalize_uploaded_row(row, row_index)
        if error:
            failed_rows.append(error)
            continue
        valid_rows.append(normalized)

    return valid_rows, failed_rows


def parse_csv_upload(uploaded_file):
    uploaded_file.seek(0)
    raw_file_content = uploaded_file.read()
    decoded_content = (
        raw_file_content.decode('utf-8-sig', errors='replace')
        if isinstance(raw_file_content, bytes)
        else str(raw_file_content)
    )
    return parse_csv_content(decoded_content)


def parse_json_upload(payload_rows):
    valid_rows = []
    failed_rows = []

    for row_index, row in enumerate(payload_rows, start=1):
        normalized, error = normalize_uploaded_row(row, row_index)
        if error:
            failed_rows.append(error)
            continue
        valid_rows.append(normalized)

    return valid_rows, failed_rows


def product_row_key(name: str, category: str) -> tuple[str, str]:
    return (name.strip().lower(), (category or 'General').strip().lower())


def apply_product_rows(
    pharmacy,
    website_setup,
    products_data,
    failed_rows,
    *,
    remove_missing: bool = False,
    synced_before=None,
):
    if not products_data and failed_rows:
        failed_count = len(failed_rows)
        return {
            'ok': False,
            'status_code': status.HTTP_400_BAD_REQUEST,
            'message': 'No valid rows found in upload.',
            'success_count': 0,
            'created_count': 0,
            'updated_count': 0,
            'deleted_count': 0,
            'failed_count': failed_count,
            'processed_count': failed_count,
            'failed_rows': failed_rows,
            'preview_count': 0,
        }

    created_count = 0
    updated_count = 0
    synced_keys: set[tuple[str, str]] = set()

    for row_index, product_data in enumerate(products_data, start=1):
        row_number = product_data.get('__row_number', row_index)
        row_payload = {
            'name': product_data.get('name', ''),
            'category': product_data.get('category', 'General'),
            'description': product_data.get('description', ''),
            'image_url': product_data.get('image_url', ''),
            'price': product_data.get('price', Decimal('0')),
            'stock': product_data.get('stock', 0),
        }
        synced_keys.add(product_row_key(row_payload['name'], row_payload['category']))

        try:
            with transaction.atomic():
                existing_product = Product.objects.filter(
                    pharmacy=pharmacy,
                    website_setup=website_setup,
                    name__iexact=row_payload['name'],
                    category__iexact=row_payload['category'],
                ).first()

                if existing_product:
                    existing_product.description = row_payload['description']
                    existing_product.price = row_payload['price']
                    existing_product.stock = row_payload['stock']
                    existing_product.image_url = row_payload['image_url']
                    existing_product.save()
                    updated_count += 1
                else:
                    Product.objects.create(
                        pharmacy=pharmacy,
                        website_setup=website_setup,
                        name=row_payload['name'],
                        category=row_payload['category'],
                        description=row_payload['description'],
                        image_url=row_payload['image_url'],
                        price=row_payload['price'],
                        stock=row_payload['stock'],
                    )
                    created_count += 1
        except Exception as exc:
            logger.warning(
                "Bulk product upload row failed for pharmacy %s at row %s: %s",
                pharmacy.id,
                row_number,
                exc,
            )
            failed_rows.append({
                'row': row_number,
                'errors': ['Database write failed for this row.'],
                'data': product_data.get('__raw_data', {}),
            })
            continue

    deleted_count = 0
    if remove_missing:
        for product in Product.objects.filter(pharmacy=pharmacy, website_setup=website_setup):
            product_key = product_row_key(product.name, product.category)
            if product_key not in synced_keys:
                if synced_before and product.created_at and product.created_at > synced_before:
                    continue
                product.delete()
                deleted_count += 1

    if failed_rows:
        logger.warning(
            "Bulk product upload finished with %s failed rows for pharmacy %s",
            len(failed_rows),
            pharmacy.id,
        )

    failed_count = len(failed_rows)
    status_code = status.HTTP_201_CREATED if not failed_rows else status.HTTP_200_OK
    return {
        'ok': True,
        'status_code': status_code,
        'message': f'{created_count} products created, {updated_count} products updated',
        'success_count': created_count + updated_count,
        'created_count': created_count,
        'updated_count': updated_count,
        'deleted_count': deleted_count,
        'failed_count': failed_count,
        'processed_count': created_count + updated_count + failed_count,
        'failed_rows': failed_rows,
        'preview_count': len(products_data),
    }


def should_sync_google_sheet(pharmacy, force: bool = False) -> bool:
    if not pharmacy.google_sheet_sync_enabled or not pharmacy.google_sheet_url:
        return False
    if force:
        return True
    if pharmacy.google_sheet_last_pushed_at:
        since_push = (timezone.now() - pharmacy.google_sheet_last_pushed_at).total_seconds()
        if since_push < SHEET_SYNC_INTERVAL_SECONDS:
            return False
    if not pharmacy.google_sheet_last_synced_at:
        return True
    elapsed = (timezone.now() - pharmacy.google_sheet_last_synced_at).total_seconds()
    return elapsed >= SHEET_SYNC_INTERVAL_SECONDS


def sync_from_google_sheet(pharmacy, website_setup, *, force: bool = False):
    if not should_sync_google_sheet(pharmacy, force=force):
        return {'synced': False, 'reason': 'throttled'}

    try:
        csv_content = fetch_google_sheet_csv(pharmacy.google_sheet_url)
    except GoogleSheetAccessError as exc:
        return {'synced': False, 'error': str(exc)}

    products_data, failed_rows = parse_csv_content(csv_content)

    result = apply_product_rows(
        pharmacy,
        website_setup,
        products_data,
        failed_rows,
        remove_missing=False,
    )

    pharmacy.google_sheet_last_synced_at = timezone.now()
    pharmacy.save(update_fields=['google_sheet_last_synced_at', 'updated_at'])

    return {
        'synced': True,
        'created_count': result.get('created_count', 0),
        'updated_count': result.get('updated_count', 0),
        'deleted_count': result.get('deleted_count', 0),
        'failed_count': result.get('failed_count', 0),
        'failed_rows': result.get('failed_rows', []),
        'synced_at': pharmacy.google_sheet_last_synced_at,
    }
