from rest_framework import serializers

from hospitals.models import HospitalProfile, Appointment
from core.services.subscription import get_allowed_features, check_customization_allowed


class HospitalProfileSerializer(serializers.ModelSerializer):
    subdomain = serializers.SerializerMethodField()
    business_info = serializers.SerializerMethodField()
    allowed_features = serializers.SerializerMethodField()

    def get_subdomain(self, obj):
        return obj.website_setup.subdomain if obj.website_setup else None

    def get_business_info(self, obj):
        try:
            bi = obj.website_setup.business_info
            request = self.context.get('request')
            logo_url = None
            if bi.logo:
                if request:
                    logo_url = request.build_absolute_uri(bi.logo.url)
                else:
                    logo_url = bi.logo.url
            return {
                'name': bi.name or '',
                'logo_url': logo_url,
                'contact_phone': bi.contact_phone or '',
                'contact_email': bi.contact_email or '',
                'address': bi.address or '',
                'working_hours': bi.working_hours or {},
                'years_of_experience': bi.years_of_experience,
            }
        except Exception:
            return {}

    def get_allowed_features(self, obj):
        if not obj.website_setup:
            return []
        access = get_allowed_features(obj.website_setup)
        return access.allowed_features

    class Meta:
        model = HospitalProfile
        fields = '__all__'
        read_only_fields = ('id', 'website_setup', 'created_at', 'updated_at')

    def validate(self, attrs):
        if self.instance is None:
            return attrs

        customization_keys = {'theme_settings', 'logo'}.intersection(attrs.keys())
        if not customization_keys:
            return attrs

        website_setup = getattr(self.instance, 'website_setup', None)
        if website_setup is None:
            raise serializers.ValidationError(
                'Cannot update customization: website setup not found.'
            )

        allowed, msg = check_customization_allowed(website_setup)
        if not allowed:
            raise serializers.ValidationError(msg)

        return attrs
