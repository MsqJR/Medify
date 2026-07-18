from rest_framework import serializers
from pharmacies.models import PharmacyTemplatePurchase


class PharmacyTemplatePurchaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PharmacyTemplatePurchase
        fields = [
            'id',
            'template_id',
            'template_name',
            'amount',
            'payment_method',
            'transaction_reference',
            'status',
            'purchased_at',
            'cancelled_at',
            'created_at',
            'updated_at',
        ]


class PurchaseTemplateSerializer(serializers.Serializer):
    template_id = serializers.IntegerField(min_value=1)
    payment_method = serializers.ChoiceField(choices=PharmacyTemplatePurchase.PaymentMethod.choices)
    transaction_reference = serializers.CharField(required=False, allow_blank=True, max_length=255)


class CancelTemplatePurchaseSerializer(serializers.Serializer):
    template_id = serializers.IntegerField(min_value=1)
