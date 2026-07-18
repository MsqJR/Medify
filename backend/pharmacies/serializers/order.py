from rest_framework import serializers
from pharmacies.models import PharmacyOrder, PharmacyOrderItem


class PharmacyOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PharmacyOrderItem
        fields = [
            'id',
            'product',
            'product_name',
            'product_category',
            'quantity',
            'unit_price',
            'line_total',
        ]
        read_only_fields = fields


class PharmacyOrderSerializer(serializers.ModelSerializer):
    items = PharmacyOrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = PharmacyOrder
        fields = [
            'id',
            'order_number',
            'patient_name',
            'patient_email',
            'patient_phone',
            'address',
            'city',
            'state',
            'zip_code',
            'delivery_method',
            'payment_method',
            'payment_status',
            'payment_last4',
            'notes',
            'status',
            'subtotal',
            'delivery_fee',
            'total',
            'status_updated_at',
            'owner_seen_at',
            'created_at',
            'updated_at',
            'items',
        ]
        read_only_fields = fields


class PharmacyOrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=PharmacyOrder.Status.choices)


class PharmacyOrderCreateItemSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1, max_value=1000)


class PharmacyOrderCreateSerializer(serializers.Serializer):
    owner_id = serializers.UUIDField()
    client_request_id = serializers.CharField(required=False, allow_blank=True, max_length=64)

    full_name = serializers.CharField(max_length=255)
    email = serializers.EmailField(max_length=254)
    phone = serializers.CharField(max_length=32)
    address = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True, max_length=120)
    state = serializers.CharField(required=False, allow_blank=True, max_length=120)
    zip_code = serializers.CharField(required=False, allow_blank=True, max_length=20)

    delivery_method = serializers.ChoiceField(choices=PharmacyOrder.DeliveryMethod.choices)
    payment_method = serializers.ChoiceField(choices=PharmacyOrder.PaymentMethod.choices)
    payment_last4 = serializers.CharField(required=False, allow_blank=True, max_length=4)
    notes = serializers.CharField(required=False, allow_blank=True)
    delivery_fee = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, min_value=0)

    items = PharmacyOrderCreateItemSerializer(many=True, allow_empty=False)

    def validate_full_name(self, value):
        cleaned = (value or '').strip()
        if len(cleaned) < 2:
            raise serializers.ValidationError('Full name must be at least 2 characters.')
        return cleaned

    def validate_phone(self, value):
        cleaned = (value or '').strip()
        if len(cleaned) < 6:
            raise serializers.ValidationError('Phone number is too short.')
        return cleaned

    def validate_payment_last4(self, value):
        cleaned = (value or '').strip()
        if cleaned and (len(cleaned) != 4 or not cleaned.isdigit()):
            raise serializers.ValidationError('Card last 4 digits must be exactly 4 numbers.')
        return cleaned

    def validate(self, attrs):
        delivery_method = attrs.get('delivery_method')
        payment_method = attrs.get('payment_method')

        address = (attrs.get('address') or '').strip()
        city = (attrs.get('city') or '').strip()
        state = (attrs.get('state') or '').strip()
        zip_code = (attrs.get('zip_code') or '').strip()

        if delivery_method == PharmacyOrder.DeliveryMethod.DELIVERY:
            missing = []
            if not address:
                missing.append('address')
            if not city:
                missing.append('city')
            if not state:
                missing.append('state')
            if missing:
                raise serializers.ValidationError({
                    'delivery_details': f"Delivery orders require: {', '.join(missing)}"
                })

        if payment_method == PharmacyOrder.PaymentMethod.CARD and not attrs.get('payment_last4'):
            raise serializers.ValidationError({'payment_last4': 'Card payments require last 4 digits.'})

        attrs['address'] = address
        attrs['city'] = city
        attrs['state'] = state
        attrs['zip_code'] = zip_code
        attrs['notes'] = (attrs.get('notes') or '').strip()
        attrs['client_request_id'] = (attrs.get('client_request_id') or '').strip()

        return attrs
