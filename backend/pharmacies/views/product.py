from decimal import Decimal

from django.db.models import Max, Q
from django.utils import timezone
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from core.models import WebsiteSetup
from pharmacies.models import Pharmacy, Product
from pharmacies.serializers import (
    ProductBulkUploadFromSheetSerializer,
    ProductBulkUploadSerializer,
    ProductConnectGoogleSheetSerializer,
    ProductCreateUpdateSerializer,
    ProductSerializer,
)
from pharmacies.services.google_sheet import (
    fetch_google_sheet_csv,
    get_service_account_email,
    pharmacy_sheet_push_available,
)
from pharmacies.services.product_sync import (
    SHEET_SYNC_INTERVAL_SECONDS,
    _maybe_push_to_google_sheet,
)
from pharmacies.services.product_bulk_service import (
    apply_product_rows,
    parse_csv_content,
    parse_csv_upload,
    parse_json_upload,
    sync_from_google_sheet,
)
from pharmacies.views.helpers import (
    _build_default_pharmacy_name,
    _default_subdomain,
)


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    pagination_class = None
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'in_stock']
    search_fields = ['name', 'category', 'description']
    ordering_fields = ['created_at', 'updated_at', 'price', 'name', 'stock']
    ordering = ['-updated_at']

    def _get_or_create_website_setup(self):
        return WebsiteSetup.objects.get_or_create(
            user=self.request.user,
            defaults={'subdomain': _default_subdomain(self.request.user.email)},
        )

    def _get_or_create_pharmacy(self):
        website_setup, _ = self._get_or_create_website_setup()
        pharmacy, _ = Pharmacy.objects.get_or_create(
            user=self.request.user,
            defaults={
                'website_setup': website_setup,
                'name': _build_default_pharmacy_name(self.request.user),
                'template_id': website_setup.template_id,
            },
        )
        if not pharmacy.website_setup_id:
            pharmacy.website_setup = website_setup
            pharmacy.save(update_fields=['website_setup', 'updated_at'])
        return pharmacy, website_setup

    def get_queryset(self):
        queryset = Product.objects.select_related('pharmacy', 'website_setup').filter(
            Q(pharmacy__user=self.request.user) | Q(website_setup__user=self.request.user)
        ).distinct().order_by('-updated_at')

        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__iexact=category)

        return queryset

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductSerializer

    def perform_create(self, serializer):
        pharmacy, website_setup = self._get_or_create_pharmacy()

        payload = {'pharmacy': pharmacy, 'website_setup': website_setup}
        if self.request.FILES.get('image'):
            payload['image_url'] = ''

        serializer.save(**payload)
        self._maybe_push_to_google_sheet(pharmacy)

    def perform_update(self, serializer):
        if self.request.FILES.get('image'):
            serializer.save(image_url='')
        else:
            serializer.save()

        pharmacy = serializer.instance.pharmacy
        if not pharmacy:
            pharmacy, _ = self._get_or_create_pharmacy()
        self._maybe_push_to_google_sheet(pharmacy)

    def perform_destroy(self, instance):
        pharmacy = instance.pharmacy
        if not pharmacy:
            pharmacy, _ = self._get_or_create_pharmacy()
        instance.delete()
        self._maybe_push_to_google_sheet(pharmacy)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        queryset = self.get_queryset()
        total = queryset.count()
        out_of_stock = queryset.filter(stock=0).count()
        low_stock = queryset.filter(stock__gt=0, stock__lt=5).count()
        categories = queryset.values_list('category', flat=True).distinct().count()
        last_updated = queryset.aggregate(last_updated=Max('updated_at'))['last_updated']

        return Response({
            'total': total,
            'out_of_stock': out_of_stock,
            'low_stock': low_stock,
            'categories': categories,
            'last_updated': last_updated,
        })

    def _maybe_push_to_google_sheet(self, pharmacy):
        return _maybe_push_to_google_sheet(pharmacy)

    def list(self, request, *args, **kwargs):
        pharmacy, website_setup = self._get_or_create_pharmacy()
        force_sync = request.query_params.get('force') in {'1', 'true', 'yes'}
        if pharmacy.google_sheet_sync_enabled and pharmacy.google_sheet_url:
            sync_from_google_sheet(pharmacy, website_setup, force=force_sync)
        return super().list(request, *args, **kwargs)

    @action(detail=False, methods=['post'])
    def bulk_upload(self, request):
        pharmacy, website_setup = self._get_or_create_pharmacy()

        uploaded_file = request.FILES.get('file')
        if uploaded_file:
            products_data, failed_rows = parse_csv_upload(uploaded_file)
        else:
            serializer = ProductBulkUploadSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            products_data, failed_rows = parse_json_upload(serializer.validated_data['products'])

        result = apply_product_rows(pharmacy, website_setup, products_data, failed_rows)
        status_code = result.pop('status_code', status.HTTP_200_OK)
        result.pop('ok', True)
        response = Response(result, status=status_code)
        if pharmacy.google_sheet_sync_enabled:
            self._maybe_push_to_google_sheet(pharmacy)
        return response

    @action(detail=False, methods=['post'], url_path='bulk_upload_from_sheet')
    def bulk_upload_from_sheet(self, request):
        serializer = ProductBulkUploadFromSheetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        sheet_url = serializer.validated_data['url']
        dry_run = serializer.validated_data.get('dry_run', False)

        try:
            csv_content = fetch_google_sheet_csv(sheet_url)
        except GoogleSheetAccessError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        products_data, failed_rows = parse_csv_content(csv_content)

        if dry_run:
            failed_count = len(failed_rows)
            valid_count = len(products_data)
            if valid_count == 0 and failed_count == 0:
                return Response(
                    {
                        'message': 'No product rows found in the Google Sheet.',
                        'preview_count': 0,
                        'failed_count': 0,
                        'failed_rows': [],
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            return Response(
                {
                    'message': f'{valid_count} valid rows ready to import.',
                    'preview_count': valid_count,
                    'failed_count': failed_count,
                    'failed_rows': failed_rows,
                    'preview_rows': [
                        {
                            'name': row.get('name', ''),
                            'category': row.get('category', ''),
                            'price': str(row.get('price', '')),
                            'stock': row.get('stock', 0),
                        }
                        for row in products_data[:6]
                    ],
                },
                status=status.HTTP_200_OK,
            )

        pharmacy, website_setup = self._get_or_create_pharmacy()
        enable_live_sync = serializer.validated_data.get('enable_live_sync', True)
        if enable_live_sync:
            pharmacy.google_sheet_url = sheet_url
            pharmacy.google_sheet_sync_enabled = True
            pharmacy.save(update_fields=['google_sheet_url', 'google_sheet_sync_enabled', 'updated_at'])

        result = apply_product_rows(pharmacy, website_setup, products_data, failed_rows, remove_missing=enable_live_sync)
        status_code = result.pop('status_code', status.HTTP_200_OK)
        result.pop('ok', True)
        response = Response(result, status=status_code)
        if enable_live_sync:
            pharmacy.google_sheet_last_synced_at = timezone.now()
            pharmacy.save(update_fields=['google_sheet_last_synced_at', 'updated_at'])
        return response

    @action(detail=False, methods=['get'], url_path='sheet_sync_status')
    def sheet_sync_status(self, request):
        pharmacy, _ = self._get_or_create_pharmacy()
        return Response({
            'google_sheet_url': pharmacy.google_sheet_url,
            'google_sheet_webhook_url': pharmacy.google_sheet_webhook_url,
            'google_sheet_sync_enabled': pharmacy.google_sheet_sync_enabled,
            'google_sheet_last_synced_at': pharmacy.google_sheet_last_synced_at,
            'google_sheet_last_pushed_at': pharmacy.google_sheet_last_pushed_at,
            'google_sheets_write_configured': pharmacy_sheet_push_available(pharmacy),
            'google_service_account_email': get_service_account_email(),
            'sync_interval_seconds': SHEET_SYNC_INTERVAL_SECONDS,
        })

    @action(detail=False, methods=['post'], url_path='connect_google_sheet')
    def connect_google_sheet(self, request):
        serializer = ProductConnectGoogleSheetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        pharmacy, website_setup = self._get_or_create_pharmacy()
        pharmacy.google_sheet_url = serializer.validated_data['url']
        pharmacy.google_sheet_webhook_url = (serializer.validated_data.get('webhook_url') or '').strip()
        pharmacy.google_sheet_sync_enabled = True
        pharmacy.save(update_fields=[
            'google_sheet_url',
            'google_sheet_webhook_url',
            'google_sheet_sync_enabled',
            'updated_at',
        ])

        sync_result = sync_from_google_sheet(pharmacy, website_setup, force=True)
        return Response({
            'message': 'Google Sheet connected for live sync.',
            'google_sheet_url': pharmacy.google_sheet_url,
            'google_sheet_webhook_url': pharmacy.google_sheet_webhook_url,
            'google_sheet_sync_enabled': pharmacy.google_sheet_sync_enabled,
            'google_sheet_last_synced_at': pharmacy.google_sheet_last_synced_at,
            'google_sheet_last_pushed_at': pharmacy.google_sheet_last_pushed_at,
            'google_sheets_write_configured': pharmacy_sheet_push_available(pharmacy),
            'google_service_account_email': get_service_account_email(),
            'sync_interval_seconds': SHEET_SYNC_INTERVAL_SECONDS,
            'sync': sync_result,
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='disconnect_google_sheet')
    def disconnect_google_sheet(self, request):
        pharmacy, _ = self._get_or_create_pharmacy()
        pharmacy.google_sheet_url = ''
        pharmacy.google_sheet_webhook_url = ''
        pharmacy.google_sheet_sync_enabled = False
        pharmacy.google_sheet_last_synced_at = None
        pharmacy.google_sheet_last_pushed_at = None
        pharmacy.save(update_fields=[
            'google_sheet_url',
            'google_sheet_webhook_url',
            'google_sheet_sync_enabled',
            'google_sheet_last_synced_at',
            'google_sheet_last_pushed_at',
            'updated_at',
        ])
        return Response({
            'message': 'Google Sheet live sync disconnected.',
            'google_sheet_sync_enabled': False,
        })

    @action(
        detail=False,
        methods=['get'],
        url_path='public',
        permission_classes=[permissions.AllowAny],
        authentication_classes=[],
    )
    def public_list(self, request):
        owner_id = request.query_params.get('owner_id')
        if not owner_id:
            return Response({'error': 'owner_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        pharmacy = Pharmacy.objects.select_related('website_setup', 'user').filter(user_id=owner_id).first()
        if not pharmacy:
            return Response({'error': 'Pharmacy not found.'}, status=status.HTTP_404_NOT_FOUND)

        website_setup = pharmacy.website_setup
        force_sync = request.query_params.get('sync') in {'1', 'true', 'yes'}
        sync_result = None
        if pharmacy.google_sheet_sync_enabled and pharmacy.google_sheet_url:
            sync_result = sync_from_google_sheet(pharmacy, website_setup, force=force_sync)

        products = Product.objects.filter(pharmacy=pharmacy).order_by('-updated_at')
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response({
            'products': serializer.data,
            'google_sheet_sync_enabled': pharmacy.google_sheet_sync_enabled,
            'google_sheet_last_synced_at': pharmacy.google_sheet_last_synced_at,
            'sync_interval_seconds': SHEET_SYNC_INTERVAL_SECONDS,
            'sync': sync_result,
        })

    @action(detail=False, methods=['get'])
    def debug_info(self, request):
        products = self.get_queryset()[:10]
        return Response({
            'total_count': self.get_queryset().count(),
            'sample_products': [
                {
                    'id': str(p.id),
                    'pharmacy_id': str(p.pharmacy_id) if p.pharmacy_id else None,
                    'name': p.name,
                    'stock': p.stock,
                    'stock_type': type(p.stock).__name__,
                    'in_stock': p.in_stock,
                    'price': str(p.price),
                }
                for p in products
            ]
        })

    @action(detail=False, methods=['delete'])
    def delete_all(self, request):
        pharmacy, _ = self._get_or_create_pharmacy()
        owned_products = Product.objects.filter(
            Q(pharmacy__user=request.user) | Q(website_setup__user=request.user)
        )
        count = owned_products.count()
        owned_products.delete()
        push_result = self._maybe_push_to_google_sheet(pharmacy)
        return Response({
            'message': f'{count} products deleted successfully',
            'sheet_push': push_result,
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        products = self.get_queryset().order_by('category', 'name')
        categories = {}

        for product in products:
            if product.category not in categories:
                categories[product.category] = []
            categories[product.category].append(ProductSerializer(product, context={'request': request}).data)

        return Response(categories)
