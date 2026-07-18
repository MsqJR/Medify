from decimal import Decimal

from django.db import transaction
from django.db.models import Q
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.parsers import JSONParser
from rest_framework.response import Response

from core.models import WebsiteSetup
from pharmacies.models import Pharmacy, PharmacyOrder, PharmacyOrderItem, Product
from pharmacies.serializers import (
    PharmacyOrderCreateSerializer,
    PharmacyOrderSerializer,
    PharmacyOrderStatusUpdateSerializer,
)
from pharmacies.services.product_sync import _maybe_push_to_google_sheet
from pharmacies.views.helpers import (
    _build_default_pharmacy_name,
    _default_subdomain,
    _generate_order_number,
    user_model,
)


class PharmacyOrderViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser]
    serializer_class = PharmacyOrderSerializer
    pagination_class = None

    def get_authenticators(self):
        if getattr(self, 'action', None) == 'place':
            return []
        return super().get_authenticators()

    def get_permissions(self):
        if getattr(self, 'action', None) == 'place':
            return [permissions.AllowAny()]
        return super().get_permissions()

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return PharmacyOrder.objects.none()

        return PharmacyOrder.objects.select_related('pharmacy', 'website_setup').prefetch_related('items').filter(
            Q(pharmacy__user=self.request.user) | Q(website_setup__user=self.request.user)
        ).distinct().order_by('-created_at')

    def _get_unseen_confirmed_orders_queryset(self):
        return self.get_queryset().filter(
            owner_seen_at__isnull=True,
        ).filter(
            Q(payment_status=PharmacyOrder.PaymentStatus.PAID) | Q(status=PharmacyOrder.Status.COMPLETED),
        )

    def _get_or_create_owner_context(self, owner_id):
        owner = user_model.objects.filter(id=owner_id, business_type='pharmacy').first()
        if not owner:
            raise DRFValidationError('Pharmacy owner not found for the provided owner_id.')

        website_setup, _ = WebsiteSetup.objects.get_or_create(
            user=owner,
            defaults={'subdomain': _default_subdomain(owner.email)},
        )
        pharmacy, _ = Pharmacy.objects.get_or_create(
            user=owner,
            defaults={
                'website_setup': website_setup,
                'name': _build_default_pharmacy_name(owner),
                'template_id': website_setup.template_id,
            },
        )

        if not pharmacy.website_setup_id:
            pharmacy.website_setup = website_setup
            pharmacy.save(update_fields=['website_setup', 'updated_at'])

        return pharmacy, website_setup

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def unseen_count(self, request):
        return Response({'count': self._get_unseen_confirmed_orders_queryset().count()})

    @action(detail=False, methods=['post'])
    def mark_seen(self, request):
        unseen_queryset = self._get_unseen_confirmed_orders_queryset()
        order_ids = request.data.get('order_ids')

        if isinstance(order_ids, list) and order_ids:
            unseen_queryset = unseen_queryset.filter(id__in=order_ids)

        seen_timestamp = timezone.now()
        marked_seen = unseen_queryset.update(owner_seen_at=seen_timestamp)

        return Response(
            {
                'marked_seen': marked_seen,
                'remaining_unseen': self._get_unseen_confirmed_orders_queryset().count(),
            }
        )

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny], authentication_classes=[])
    def place(self, request):
        serializer = PharmacyOrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        pharmacy, website_setup = self._get_or_create_owner_context(payload['owner_id'])

        client_request_id = payload.get('client_request_id', '').strip()
        if client_request_id:
            existing = PharmacyOrder.objects.select_related('pharmacy', 'website_setup').prefetch_related('items').filter(
                website_setup=website_setup,
                client_request_id=client_request_id,
            ).first()
            if existing:
                return Response(
                    {
                        'message': 'Duplicate order submission ignored.',
                        'duplicate': True,
                        'order': PharmacyOrderSerializer(existing, context={'request': request}).data,
                    },
                    status=status.HTTP_200_OK,
                )

        order_items = payload['items']
        product_ids = [item['product_id'] for item in order_items]

        with transaction.atomic():
            products = Product.objects.select_for_update().filter(
                Q(pharmacy=pharmacy) | Q(website_setup=website_setup),
                id__in=product_ids,
            ).distinct()
            product_map = {str(product.id): product for product in products}

            item_errors = []
            for index, item in enumerate(order_items, start=1):
                product = product_map.get(str(item['product_id']))
                quantity = int(item['quantity'])

                if not product:
                    item_errors.append(f'Item {index}: product not found.')
                    continue
                if quantity <= 0:
                    item_errors.append(f'Item {index}: quantity must be at least 1.')
                    continue
                if product.stock < quantity:
                    item_errors.append(
                        f'Item {index}: only {product.stock} units available for {product.name}.',
                    )

            if item_errors:
                return Response(
                    {
                        'detail': 'Order could not be placed due to invalid item quantities.',
                        'items': item_errors,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            order = PharmacyOrder.objects.create(
                pharmacy=pharmacy,
                website_setup=website_setup,
                order_number=_generate_order_number(),
                client_request_id=client_request_id,
                patient_name=payload['full_name'],
                patient_email=payload['email'],
                patient_phone=payload['phone'],
                address=payload.get('address', ''),
                city=payload.get('city', ''),
                state=payload.get('state', ''),
                zip_code=payload.get('zip_code', ''),
                delivery_method=payload['delivery_method'],
                payment_method=payload['payment_method'],
                payment_status=(
                    PharmacyOrder.PaymentStatus.PAID
                    if payload['payment_method'] == PharmacyOrder.PaymentMethod.CARD
                    else PharmacyOrder.PaymentStatus.PENDING
                ),
                payment_last4=payload.get('payment_last4', ''),
                notes=payload.get('notes', ''),
                status=PharmacyOrder.Status.PENDING,
                subtotal=Decimal('0.00'),
                delivery_fee=payload.get('delivery_fee', Decimal('0.00')),
                total=Decimal('0.00'),
            )

            subtotal = Decimal('0.00')
            for item in order_items:
                product = product_map[str(item['product_id'])]
                quantity = int(item['quantity'])
                line_total = product.price * quantity

                PharmacyOrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name=product.name,
                    product_category=product.category,
                    quantity=quantity,
                    unit_price=product.price,
                    line_total=line_total,
                )

                subtotal += line_total
                product.stock -= quantity
                product.save()

            order.subtotal = subtotal
            order.total = subtotal + order.delivery_fee
            order.status_updated_at = timezone.now()
            order.save(update_fields=['subtotal', 'total', 'status_updated_at', 'updated_at'])

        _maybe_push_to_google_sheet(pharmacy)

        return Response(
            {
                'message': 'Order placed successfully.',
                'duplicate': False,
                'order': PharmacyOrderSerializer(order, context={'request': request}).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        order = self.get_object()
        serializer = PharmacyOrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        old_status = order.status

        with transaction.atomic():
            if new_status == PharmacyOrder.Status.CANCELLED and old_status != PharmacyOrder.Status.CANCELLED:
                for item in order.items.all():
                    if item.product:
                        product = Product.objects.select_for_update().get(id=item.product.id)
                        product.stock += item.quantity
                        product.save()

            order.status = new_status
            if order.status == PharmacyOrder.Status.COMPLETED:
                order.payment_status = PharmacyOrder.PaymentStatus.PAID
            order.status_updated_at = timezone.now()
            order.save(update_fields=['status', 'payment_status', 'status_updated_at', 'updated_at'])

        if new_status == PharmacyOrder.Status.CANCELLED and old_status != PharmacyOrder.Status.CANCELLED:
            _maybe_push_to_google_sheet(order.pharmacy)

        return Response(PharmacyOrderSerializer(order, context={'request': request}).data)

    def destroy(self, request, pk=None):
        order = self.get_object()
        if order.status != PharmacyOrder.Status.CANCELLED:
            return Response(
                {'detail': 'Only cancelled orders can be deleted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        order.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        queryset = self.get_queryset()
        return Response(
            {
                'total': queryset.count(),
                'pending': queryset.filter(status=PharmacyOrder.Status.PENDING).count(),
                'processing': queryset.filter(status=PharmacyOrder.Status.PROCESSING).count(),
                'completed': queryset.filter(status=PharmacyOrder.Status.COMPLETED).count(),
                'cancelled': queryset.filter(status=PharmacyOrder.Status.CANCELLED).count(),
            }
        )

    @action(detail=False, methods=['get'])
    def notifications(self, request):
        queryset = self.get_queryset()
        since_raw = (request.query_params.get('since') or '').strip()
        since = parse_datetime(since_raw) if since_raw else None

        if since is not None and timezone.is_naive(since):
            since = timezone.make_aware(since, timezone.get_current_timezone())
        if since is not None:
            queryset = queryset.filter(created_at__gt=since)

        orders = list(queryset.order_by('-created_at')[:10])
        payload = []
        for order in orders:
            first_item = order.items.first()
            payload.append(
                {
                    'id'            : str(order.id),
                    'order_number'  : order.order_number,
                    'patient_name'  : order.patient_name,
                    'status'        : order.status,
                    'created_at'    : order.created_at,
                    'first_product' : first_item.product_name if first_item else '',
                }
            )

        return Response({'count': queryset.count(), 'orders': payload})
