from rest_framework import serializers
from decimal import Decimal
from django.core.validators import URLValidator
from pharmacies.models import Product


http_image_url_validator = URLValidator(schemes=['http', 'https'])


class ProductSerializer(serializers.ModelSerializer):
    image_url_resolved = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'pharmacy',
            'name',
            'category',
            'description',
            'image',
            'image_url',
            'image_url_resolved',
            'price',
            'stock',
            'in_stock',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'pharmacy', 'in_stock', 'created_at', 'updated_at']

    def get_image_url_resolved(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url or None


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['name', 'category', 'description', 'image', 'image_url', 'price', 'stock']

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative")
        if value >= Decimal('100000000'):
            raise serializers.ValidationError("Price cannot exceed 99,999,999.99")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative")
        if value > 2147483647:
            raise serializers.ValidationError("Stock cannot exceed 2,147,483,647")
        return value

    def validate_category(self, value):
        cleaned = (value or '').strip()
        return cleaned or 'General'

    def validate_image_url(self, value):
        cleaned = (value or '').strip()
        if not cleaned:
            return ''

        http_image_url_validator(cleaned)
        return cleaned


class ProductBulkUploadSerializer(serializers.Serializer):
    products = serializers.ListField(
        child=serializers.DictField(),
        allow_empty=False
    )

    def validate_products(self, value):
        for idx, product in enumerate(value, start=1):
            if not isinstance(product, dict):
                raise serializers.ValidationError(f"Row {idx}: each row must be a JSON object.")
        return value


class ProductBulkUploadFromSheetSerializer(serializers.Serializer):
    url = serializers.URLField()
    dry_run = serializers.BooleanField(required=False, default=False)
    enable_live_sync = serializers.BooleanField(required=False, default=True)


class ProductConnectGoogleSheetSerializer(serializers.Serializer):
    url = serializers.URLField()
    webhook_url = serializers.URLField(required=False, allow_blank=True)
