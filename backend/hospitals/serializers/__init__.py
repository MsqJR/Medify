from hospitals.serializers.profile import HospitalProfileSerializer
from hospitals.serializers.department import DepartmentSerializer
from hospitals.serializers.doctor import DoctorScheduleSerializer, DoctorSerializer
from hospitals.serializers.appointment import AppointmentSerializer, AppointmentAdminSerializer
from hospitals.serializers.page import BlockSerializer, PageSerializer
from hospitals.serializers.photo_serializers import HospitalPhotoSerializer, HospitalPhotoUpdateOrderSerializer
from hospitals.serializers.review import ReviewSerializer

__all__ = [
    'HospitalProfileSerializer',
    'DepartmentSerializer',
    'DoctorScheduleSerializer',
    'DoctorSerializer',
    'AppointmentSerializer',
    'AppointmentAdminSerializer',
    'BlockSerializer',
    'PageSerializer',
    'HospitalPhotoSerializer',
    'HospitalPhotoUpdateOrderSerializer',
    'ReviewSerializer',
]
