from rest_framework import serializers
from .user_serializers import UserSerializer
from core.models import WebsiteSetup
from core.services.subscription import (
    apply_subscription_update,
    get_allowed_features,
    can_publish_hospital,
    validate_subscription_transition,
)


class WebsiteSetupSerializer(serializers.ModelSerializer):
    """Serializer for WebsiteSetup model"""
    user = UserSerializer(read_only=True)
    allowed_features = serializers.SerializerMethodField()
    can_publish = serializers.SerializerMethodField()
    is_subscription_active = serializers.SerializerMethodField()

    class Meta:
        model = WebsiteSetup
        fields = [
            'id', 'user', 'subdomain',
            # Feature flags (boolean toggles on the model)
            'review_system', 'ai_chatbot', 'ambulance_ordering',
            'patient_portal', 'prescription_refill',
            # Template
            'template_id',
            # Payment (legacy)
            'is_paid', 'total_price',
            # Subscription
            'plan_type', 'subscription_status', 'subscription_ends_at', 'one_time_features',
            # Computed
            'allowed_features', 'can_publish', 'is_subscription_active',
            # Timestamps
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'user', 'created_at', 'updated_at',
            'allowed_features', 'can_publish', 'is_subscription_active',
        ]

    def validate(self, attrs):
        if self.instance:
            attrs = validate_subscription_transition(self.instance, attrs)
        return attrs

    def update(self, instance, validated_data):
        validated_data = apply_subscription_update(instance, validated_data)
        return super().update(instance, validated_data)

    def get_allowed_features(self, obj) -> list:
        return get_allowed_features(obj).allowed_features

    def get_can_publish(self, obj) -> bool:
        return can_publish_hospital(obj)

    def get_is_subscription_active(self, obj) -> bool:
        return get_allowed_features(obj).is_active
