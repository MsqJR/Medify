from rest_framework import serializers
from hospitals.models import Doctor, DoctorSchedule


class DoctorScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorSchedule
        fields = '__all__'
        read_only_fields = ('id', 'doctor')


class DoctorSerializer(serializers.ModelSerializer):
    schedules = DoctorScheduleSerializer(many=True, read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    image_url_resolved = serializers.SerializerMethodField()
    specialty = serializers.CharField(required=False, allow_blank=True)

    def get_image_url_resolved(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url or None

    def validate_department(self, value):
        request = self.context.get('request')
        if request is not None and value.website_setup.user_id != request.user.id:
            raise serializers.ValidationError('Department does not belong to your hospital.')
        return value

    def validate(self, attrs):
        department = attrs.get('department')
        if department:
            attrs['specialty'] = department.name
        elif self.instance and self.instance.department:
            attrs['specialty'] = self.instance.department.name
        return attrs

    class Meta:
        model = Doctor
        fields = '__all__'
        read_only_fields = ('id', 'website_setup', 'created_at', 'updated_at')
