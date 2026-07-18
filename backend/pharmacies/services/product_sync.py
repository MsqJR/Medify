import logging
import re
from decimal import Decimal, InvalidOperation

from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from django.utils import timezone

from pharmacies.services.google_sheet import (
    GoogleSheetWriteError,
    push_products_to_connected_sheet,
)
from pharmacies.models import Product


logger = logging.getLogger(__name__)

SHEET_SYNC_INTERVAL_SECONDS = 300


def _normalize_column_token(value: str) -> str:
    return re.sub(r'[^a-z0-9]+', '', (value or '').strip().lower())


CSV_COLUMN_ALIASES = {
    'name': 'name',
    'productname': 'name',
    'product': 'name',
    'itemname': 'name',
    'category': 'category',
    'productcategory': 'category',
    'type': 'category',
    'price': 'price',
    'unitprice': 'price',
    'sellingprice': 'price',
    'productprice': 'price',
    'stock': 'stock',
    'stockquantity': 'stock',
    'quantity': 'stock',
    'qty': 'stock',
    'stockqty': 'stock',
    'description': 'description',
    'productdescription': 'description',
    'details': 'description',
    'imageurl': 'image_url',
    'image': 'image_url',
    'imagelink': 'image_url',
}

REQUIRED_UPLOAD_COLUMNS = {'name', 'category', 'price', 'stock', 'description'}

REQUIRED_UPLOAD_COLUMN_LABELS = {
    'name': 'Product Name',
    'category': 'Category',
    'price': 'Price',
    'stock': 'Stock Quantity',
    'description': 'Description',
}

HTTP_IMAGE_URL_VALIDATOR = URLValidator(schemes=['http', 'https'])


def _normalize_image_url(raw_value: str) -> str:
    value = (raw_value or '').strip()
    if not value:
        return ''

    try:
        HTTP_IMAGE_URL_VALIDATOR(value)
    except ValidationError:
        return ''

    return value


def _coerce_price_decimal(raw_value: str) -> Decimal:
    value = (raw_value or '').strip()
    if not value:
        raise ValueError('price is required')

    numeric_text = re.sub(r'[^0-9,\.\-]', '', value)
    if not numeric_text:
        raise ValueError('price is required')

    if ',' in numeric_text and '.' in numeric_text:
        if numeric_text.rfind(',') > numeric_text.rfind('.'):
            numeric_text = numeric_text.replace('.', '').replace(',', '.')
        else:
            numeric_text = numeric_text.replace(',', '')
    elif ',' in numeric_text:
        parts = numeric_text.split(',')
        if len(parts) == 2 and len(parts[1]) <= 2:
            numeric_text = numeric_text.replace(',', '.')
        else:
            numeric_text = numeric_text.replace(',', '')

    try:
        parsed = Decimal(numeric_text)
    except InvalidOperation as exc:
        raise ValueError('price must be a valid number') from exc

    if parsed < 0:
        raise ValueError('price cannot be negative')
    if parsed >= Decimal('100000000'):
        raise ValueError('price cannot exceed 99,999,999.99')

    return parsed


def _coerce_stock_integer(raw_value: str) -> int:
    value = (raw_value or '').strip()
    if not value:
        raise ValueError('stock quantity is required')

    numeric_text = re.sub(r'[^0-9,\.\-]', '', value)
    if not numeric_text:
        raise ValueError('stock quantity is required')

    if ',' in numeric_text and '.' in numeric_text:
        if numeric_text.rfind(',') > numeric_text.rfind('.'):
            numeric_text = numeric_text.replace('.', '').replace(',', '.')
        else:
            numeric_text = numeric_text.replace(',', '')
    elif ',' in numeric_text:
        parts = numeric_text.split(',')
        if len(parts) == 2 and len(parts[1]) <= 2:
            numeric_text = numeric_text.replace(',', '.')
        else:
            numeric_text = numeric_text.replace(',', '')

    try:
        parsed = Decimal(numeric_text)
    except InvalidOperation as exc:
        raise ValueError('stock must be an integer') from exc

    if parsed != parsed.to_integral_value():
        raise ValueError('stock must be an integer')

    if parsed > 2147483647:
        raise ValueError('stock cannot exceed 2,147,483,647')

    stock = int(parsed)
    if stock < 0:
        raise ValueError('stock cannot be negative')

    return stock


def _maybe_push_to_google_sheet(pharmacy):
    if not pharmacy or not pharmacy.google_sheet_sync_enabled or not pharmacy.google_sheet_url:
        return {'pushed': False, 'reason': 'not_connected'}

    pharmacy.google_sheet_last_pushed_at = timezone.now()
    pharmacy.save(update_fields=['google_sheet_last_pushed_at', 'updated_at'])

    try:
        products = Product.objects.filter(pharmacy=pharmacy).order_by('category', 'name', 'id')
        push_products_to_connected_sheet(pharmacy, products)
        return {'pushed': True, 'pushed_at': pharmacy.google_sheet_last_pushed_at}
    except GoogleSheetWriteError as exc:
        logger.warning('Google Sheet push failed for pharmacy %s: %s', pharmacy.id, exc)
        return {'pushed': False, 'error': str(exc)}
