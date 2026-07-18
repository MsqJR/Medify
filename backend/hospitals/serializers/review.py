from rest_framework import serializers
from hospitals.models import Review


class ReviewSerializer(serializers.ModelSerializer):
    appointment_details = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ('id', 'appointment', 'doctor', 'website_setup', 'created_at')

    def get_appointment_details(self, obj):
        if hasattr(obj, 'appointment') and obj.appointment:
            return {
                'patient_name': obj.appointment.patient_name,
                'start_datetime': obj.appointment.start_datetime,
                'doctor_name': obj.doctor.name if obj.doctor else None,
            }
        return None
