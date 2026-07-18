from decimal import Decimal

from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from core.models import WebsiteSetup
from pharmacies.models import Pharmacy, PharmacyTemplatePurchase, Product
from pharmacies.serializers import (
    CancelTemplatePurchaseSerializer,
    PharmacyCreateUpdateSerializer,
    PharmacySerializer,
    PharmacyTemplatePurchaseSerializer,
    PurchaseTemplateSerializer,
)
from pharmacies.services.product_sync import _maybe_push_to_google_sheet
from pharmacies.views.helpers import (
    PHARMACY_TEMPLATE_CATALOG,
    _build_default_pharmacy_name,
    _default_subdomain,
)


class PharmacyViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

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

        updates = []
        if not pharmacy.website_setup_id:
            pharmacy.website_setup = website_setup
            updates.append('website_setup')
        if pharmacy.template_id is None and website_setup.template_id is not None:
            pharmacy.template_id = website_setup.template_id
            updates.append('template_id')
        if updates:
            pharmacy.save(update_fields=updates + ['updated_at'])

        return pharmacy

    def _sync_selected_template_state(self, pharmacy, selected_template_id):
        pharmacy.template_id = selected_template_id
        pharmacy.save(update_fields=['template_id', 'updated_at'])

        if not pharmacy.website_setup_id:
            return

        website_setup = pharmacy.website_setup
        website_setup.template_id = selected_template_id

        if selected_template_id is None:
            website_setup.is_paid = False
            website_setup.total_price = Decimal('0.00')
        else:
            active_purchase = pharmacy.template_purchases.filter(
                template_id=selected_template_id,
                status=PharmacyTemplatePurchase.Status.ACTIVE,
            ).first()
            if active_purchase:
                website_setup.is_paid = True
                website_setup.total_price = active_purchase.amount
            else:
                website_setup.is_paid = False
                website_setup.total_price = Decimal('0.00')

        website_setup.save(update_fields=['template_id', 'is_paid', 'total_price', 'updated_at'])

    @action(detail=False, methods=['get', 'post', 'patch', 'put'])
    def profile(self, request):
        pharmacy = self._get_or_create_pharmacy()

        if request.method == 'GET':
            serializer = PharmacySerializer(pharmacy, context={'request': request})
            return Response(serializer.data)

        partial = request.method in ['PATCH', 'POST']
        serializer = PharmacyCreateUpdateSerializer(pharmacy, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        requested_template_id = None
        has_template_update = 'template_id' in serializer.validated_data
        if has_template_update:
            requested_template_id = serializer.validated_data.get('template_id')
            if requested_template_id is not None:
                has_active_purchase = pharmacy.template_purchases.filter(
                    template_id=requested_template_id,
                    status=PharmacyTemplatePurchase.Status.ACTIVE,
                ).exists()
                if not has_active_purchase:
                    return Response(
                        {'detail': 'Please purchase this template before activating it.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        serializer.save()

        if has_template_update:
            self._sync_selected_template_state(pharmacy, requested_template_id)

        response_serializer = PharmacySerializer(pharmacy, context={'request': request})
        return Response(response_serializer.data)

    @action(detail=False, methods=['get'])
    def template_purchases(self, request):
        pharmacy = self._get_or_create_pharmacy()
        purchases = pharmacy.template_purchases.all().order_by('template_id')
        serializer = PharmacyTemplatePurchaseSerializer(purchases, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def purchase_template(self, request):
        pharmacy = self._get_or_create_pharmacy()
        serializer = PurchaseTemplateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        template_id = serializer.validated_data['template_id']
        template_info = PHARMACY_TEMPLATE_CATALOG.get(template_id)
        if not template_info:
            return Response(
                {'detail': 'Invalid template id.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not pharmacy.website_setup_id:
            website_setup, _ = self._get_or_create_website_setup()
            pharmacy.website_setup = website_setup
            pharmacy.save(update_fields=['website_setup', 'updated_at'])

        purchase, created = PharmacyTemplatePurchase.objects.get_or_create(
            pharmacy=pharmacy,
            template_id=template_id,
            defaults={
                'website_setup': pharmacy.website_setup,
                'template_name': template_info['name'],
                'amount': template_info['price'],
                'payment_method': serializer.validated_data['payment_method'],
                'transaction_reference': serializer.validated_data.get('transaction_reference', '').strip(),
                'status': PharmacyTemplatePurchase.Status.ACTIVE,
            },
        )

        if not created:
            purchase.website_setup = pharmacy.website_setup
            purchase.template_name = template_info['name']
            purchase.amount = template_info['price']
            purchase.payment_method = serializer.validated_data['payment_method']
            purchase.transaction_reference = serializer.validated_data.get('transaction_reference', '').strip()
            purchase.status = PharmacyTemplatePurchase.Status.ACTIVE
            purchase.cancelled_at = None
            purchase.save(
                update_fields=[
                    'website_setup',
                    'template_name',
                    'amount',
                    'payment_method',
                    'transaction_reference',
                    'status',
                    'cancelled_at',
                    'updated_at',
                ]
            )

        self._sync_selected_template_state(pharmacy, template_id)

        return Response(
            {
                'purchase': PharmacyTemplatePurchaseSerializer(purchase).data,
                'profile': PharmacySerializer(pharmacy, context={'request': request}).data,
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    @action(detail=False, methods=['post'])
    def cancel_template_purchase(self, request):
        pharmacy = self._get_or_create_pharmacy()
        serializer = CancelTemplatePurchaseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        template_id = serializer.validated_data['template_id']
        purchase = pharmacy.template_purchases.filter(
            template_id=template_id,
            status=PharmacyTemplatePurchase.Status.ACTIVE,
        ).first()

        if not purchase:
            return Response(
                {'detail': 'No active purchase exists for this template.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        purchase.status = PharmacyTemplatePurchase.Status.CANCELLED
        purchase.cancelled_at = timezone.now()
        purchase.save(update_fields=['status', 'cancelled_at', 'updated_at'])

        fallback_active = pharmacy.template_purchases.filter(
            status=PharmacyTemplatePurchase.Status.ACTIVE,
        ).order_by('-updated_at').first()
        active_template_id = fallback_active.template_id if fallback_active else None
        self._sync_selected_template_state(pharmacy, active_template_id)

        return Response(
            {
                'cancelled_purchase': PharmacyTemplatePurchaseSerializer(purchase).data,
                'active_template_id': active_template_id,
                'profile': PharmacySerializer(pharmacy, context={'request': request}).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['post'])
    def publish(self, request):
        pharmacy = self._get_or_create_pharmacy()
        pharmacy.is_published = True
        pharmacy.save(update_fields=['is_published', 'updated_at'])

        if pharmacy.website_setup_id:
            business_info = getattr(pharmacy.website_setup, 'business_info', None)
            if business_info and not business_info.is_published:
                business_info.is_published = True
                business_info.save(update_fields=['is_published', 'updated_at'])

        serializer = PharmacySerializer(pharmacy, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['delete'])
    def delete_website(self, request):
        pharmacy = Pharmacy.objects.filter(user=request.user).select_related('website_setup').first()
        if not pharmacy:
            return Response({'detail': 'Pharmacy profile was not found.'}, status=status.HTTP_404_NOT_FOUND)

        website_setup = pharmacy.website_setup
        Product.objects.filter(Q(pharmacy=pharmacy) | Q(website_setup=website_setup)).delete()

        if website_setup and hasattr(website_setup, 'business_info'):
            website_setup.business_info.delete()

        pharmacy.delete()

        if website_setup:
            website_setup.template_id = None
            website_setup.ai_chatbot = False
            website_setup.save(update_fields=['template_id', 'ai_chatbot', 'updated_at'])

        return Response({'message': 'Pharmacy website deleted successfully.'}, status=status.HTTP_200_OK)
