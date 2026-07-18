from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.db import models, transaction

from hospitals.models import HospitalProfile, Department, Doctor, DoctorSchedule, Appointment, HospitalPhoto
from hospitals.serializers import (
    HospitalProfileSerializer, DepartmentSerializer, DoctorSerializer,
    DoctorScheduleSerializer, AppointmentAdminSerializer,
    HospitalPhotoSerializer, HospitalPhotoUpdateOrderSerializer,
)
from hospitals.services.template_service import generate_default_hospital_template
from hospitals.views.helpers import _get_or_create_website_setup, download_image_to_filefield


class HospitalProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = HospitalProfileSerializer

    def get_queryset(self):
        return HospitalProfile.objects.filter(website_setup__user=self.request.user)

    @action(detail=False, methods=['get', 'post', 'patch', 'put'])
    def profile(self, request):
        website_setup = _get_or_create_website_setup(request.user)
        profile, created = HospitalProfile.objects.get_or_create(
            website_setup=website_setup,
            defaults={'name': 'My Hospital'}
        )

        if request.method == 'GET':
            return Response(self.get_serializer(profile).data)

        serializer = self.get_serializer(profile, data=request.data, partial=request.method in ['PATCH', 'POST'])
        serializer.is_valid(raise_exception=True)
        serializer.save()

        if created:
            generate_default_hospital_template(website_setup)

        return Response(self.get_serializer(profile).data)


class DepartmentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DepartmentSerializer

    def get_queryset(self):
        return Department.objects.filter(website_setup__user=self.request.user)

    def perform_create(self, serializer):
        website_setup = _get_or_create_website_setup(self.request.user)
        serializer.save(website_setup=website_setup)


class DoctorViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DoctorSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        return (
            Doctor.objects
            .filter(website_setup__user=self.request.user)
            .select_related('department')
            .prefetch_related('schedules')
            .order_by('name')
        )

    def perform_create(self, serializer):
        website_setup = _get_or_create_website_setup(self.request.user)
        payload = {'website_setup': website_setup}
        if self.request.FILES.get('image'):
            payload['image_url'] = ''
        else:
            image_url = self.request.data.get('image_url') or ''
            if image_url.strip():
                downloaded = download_image_to_filefield(image_url)
                if downloaded:
                    payload['image'] = downloaded
        serializer.save(**payload)

    def perform_update(self, serializer):
        if self.request.FILES.get('image'):
            serializer.save(image_url='')
            return

        if 'image_url' in self.request.data:
            image_url = self.request.data.get('image_url') or ''
            if image_url.strip():
                downloaded = download_image_to_filefield(image_url)
                if downloaded:
                    serializer.save(image=downloaded)
                else:
                    serializer.save(image=None)
            else:
                serializer.save(image=None, image_url='')
            return

        serializer.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DoctorScheduleViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DoctorScheduleSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = DoctorSchedule.objects.filter(doctor__website_setup__user=self.request.user)
        doctor_id = self.request.query_params.get('doctor')
        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)
        return queryset

    def perform_create(self, serializer):
        doctor_id = self.request.data.get('doctor')
        doctor = Doctor.objects.get(id=doctor_id, website_setup__user=self.request.user)
        serializer.save(doctor=doctor)


class AppointmentAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AppointmentAdminSerializer

    def get_queryset(self):
        queryset = (
            Appointment.objects
            .filter(website_setup__user=self.request.user)
            .select_related('doctor')
            .order_by('-start_datetime')
        )
        status_value = self.request.query_params.get('status')
        if status_value:
            queryset = queryset.filter(status=status_value.upper())
        return queryset

    def perform_create(self, serializer):
        doctor = serializer.validated_data['doctor']
        if doctor.website_setup.user_id != self.request.user.id:
            raise ValidationError({'doctor': 'Doctor does not belong to current user'})
        serializer.save(website_setup=doctor.website_setup)


class HospitalPhotoViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = HospitalPhotoSerializer

    def get_queryset(self):
        return HospitalPhoto.objects.filter(
            website_setup__user=self.request.user,
            is_active=True
        ).order_by('display_order', 'created_at')

    def perform_create(self, serializer):
        website_setup = _get_or_create_website_setup(self.request.user)

        if not serializer.validated_data.get('display_order'):
            max_order = HospitalPhoto.objects.filter(
                website_setup=website_setup,
                is_active=True
            ).aggregate(max_order=models.Max('display_order'))['max_order']
            next_order = (max_order or 0) + 1
            serializer.save(website_setup=website_setup, display_order=next_order)
        else:
            serializer.save(website_setup=website_setup)

    def perform_update(self, serializer):
        if self.request.FILES.get('image'):
            serializer.save(image_url='')
        else:
            serializer.save()

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'])
    def update_order(self, request):
        serializer = HospitalPhotoUpdateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        photo_ids = serializer.validated_data['photo_ids']
        website_setup = _get_or_create_website_setup(request.user)

        photos = HospitalPhoto.objects.filter(
            id__in=photo_ids,
            website_setup=website_setup,
            is_active=True
        )

        if len(photos) != len(photo_ids):
            return Response(
                {'error': 'Some photos not found or do not belong to you'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            for index, photo_id in enumerate(photo_ids):
                HospitalPhoto.objects.filter(id=photo_id).update(display_order=index + 1)

        updated_photos = HospitalPhoto.objects.filter(
            website_setup=website_setup,
            is_active=True
        ).order_by('display_order', 'created_at')

        return Response(self.get_serializer(updated_photos, many=True).data)
