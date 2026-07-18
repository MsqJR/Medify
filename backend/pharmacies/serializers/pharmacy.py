from rest_framework import serializers
import json
from pharmacies.models import Pharmacy


class PharmacySerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()
    subdomain = serializers.SerializerMethodField()

    class Meta:
        model = Pharmacy
        fields = [
            'id',
            'name',
            'description',
            'logo',
            'logo_url',
            'theme_settings',
            'template_id',
            'is_published',
            'google_sheet_url',
            'google_sheet_sync_enabled',
            'google_sheet_last_synced_at',
            'product_count',
            'subdomain',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'product_count',
            'google_sheet_url',
            'google_sheet_sync_enabled',
            'google_sheet_last_synced_at',
            'created_at',
            'updated_at',
        ]

    def get_logo_url(self, obj):
        if not obj.logo:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.logo.url)
        return obj.logo.url

    def get_product_count(self, obj):
        return obj.products.count()

    def get_subdomain(self, obj):
        if hasattr(obj, 'website_setup') and obj.website_setup:
            return obj.website_setup.subdomain
        return None


class PharmacyCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pharmacy
        fields = [
            'name',
            'description',
            'logo',
            'theme_settings',
            'template_id',
            'is_published',
        ]

    def validate_theme_settings(self, value):
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError('theme_settings must be valid JSON.')
        if value is None:
            return {}
        if not isinstance(value, dict):
            raise serializers.ValidationError('theme_settings must be a JSON object.')
        return value
