from hospitals.views.admin import (
    HospitalProfileViewSet,
    DepartmentViewSet,
    DoctorViewSet,
    DoctorScheduleViewSet,
    AppointmentAdminViewSet,
    HospitalPhotoViewSet,
)
from hospitals.views.public import PublicHospitalViewSet, BookingViewSet
from hospitals.views.reviews import AdminReviewViewSet, ReviewAPIView

__all__ = [
    'HospitalProfileViewSet',
    'DepartmentViewSet',
    'DoctorViewSet',
    'DoctorScheduleViewSet',
    'AppointmentAdminViewSet',
    'HospitalPhotoViewSet',
    'PublicHospitalViewSet',
    'BookingViewSet',
    'AdminReviewViewSet',
    'ReviewAPIView',
]
