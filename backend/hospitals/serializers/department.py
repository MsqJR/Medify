from rest_framework import serializers
from hospitals.models import Department


class DepartmentSerializer(serializers.ModelSerializer):
    doctor_count = serializers.SerializerMethodField()

    def get_doctor_count(self, obj):
        return obj.doctors.filter(is_active=True).count()

    class Meta:
        model = Department
        fields = '__all__'
        read_only_fields = ('id', 'website_setup', 'created_at', 'updated_at')
