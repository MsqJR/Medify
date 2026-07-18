from rest_framework import filters, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired

from core.models import WebsiteSetup
from hospitals.models import Appointment, Review
from hospitals.serializers import ReviewSerializer


class AdminReviewViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.business_type != 'hospital':
            return Review.objects.none()

        try:
            website_setup = WebsiteSetup.objects.get(user=user)
            return Review.objects.filter(website_setup=website_setup).select_related('appointment', 'doctor')
        except WebsiteSetup.DoesNotExist:
            return Review.objects.none()


class ReviewAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get_appointment_from_token(self, token):
        signer = TimestampSigner()
        try:
            appointment_id_str = signer.unsign(token, max_age=30 * 24 * 3600)
            return Appointment.objects.get(id=appointment_id_str)
        except (BadSignature, SignatureExpired, Appointment.DoesNotExist):
            return None

    def get(self, request, token):
        appointment = self.get_appointment_from_token(token)
        if not appointment:
            return Response({'error': 'Invalid or expired token.'}, status=401)

        if hasattr(appointment, 'review'):
            return Response({'error': 'Review already exists for this appointment.'}, status=400)

        return Response({
            'appointment_id': appointment.id,
            'doctor_name': appointment.doctor.name,
            'hospital_name': appointment.website_setup.business_info.name if hasattr(appointment.website_setup, 'business_info') else 'Hospital',
            'start_datetime': appointment.start_datetime,
        })

    def post(self, request, token):
        appointment = self.get_appointment_from_token(token)
        if not appointment:
            return Response({'error': 'Invalid or expired token.'}, status=401)

        if appointment.status not in [Appointment.Status.CONFIRMED, 'COMPLETED']:
            return Response({'error': 'Appointment must be completed or confirmed to submit a review.'}, status=400)

        if hasattr(appointment, 'review'):
            return Response({'error': 'Review already exists for this appointment.'}, status=400)

        data = request.data.copy()
        serializer = ReviewSerializer(data=data)
        if serializer.is_valid():
            serializer.save(
                appointment=appointment,
                doctor=appointment.doctor,
                website_setup=appointment.website_setup
            )
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
