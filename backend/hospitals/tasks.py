from datetime import timedelta
import logging
from django.utils import timezone
from django.core.mail import send_mail
from django.core.signing import TimestampSigner
from django.conf import settings
from .models import Appointment

logger = logging.getLogger(__name__)

def send_individual_review_email(appointment_id):
    """
    Sends a review email to the patient of the given appointment ID.
    """
    try:
        appointment = Appointment.objects.get(id=appointment_id)
    except Appointment.DoesNotExist:
        logger.error(f"Cannot send review email: Appointment {appointment_id} does not exist.")
        return False

    if appointment.review_email_sent:
        return False

    # Check if review already exists just in case
    if hasattr(appointment, 'review'):
        appointment.review_email_sent = True
        appointment.save(update_fields=['review_email_sent'])
        return False

    if not appointment.patient_email:
        return False

    signer = TimestampSigner()
    token = signer.sign(str(appointment.id))
    
    # Use root domain since review page is global
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    review_link = f"{frontend_url}/review/{token}"
    
    doctor_name = appointment.doctor.name
    hospital_name = appointment.website_setup.business_info.name if hasattr(appointment.website_setup, 'business_info') else 'our hospital'
    
    subject = f"How was your visit with {doctor_name}?"
    message = (
        f"Dear {appointment.patient_name},\n\n"
        f"We hope you had a good visit with {doctor_name} at {hospital_name}.\n\n"
        f"Please take a moment to leave a review of your experience:\n"
        f"{review_link}\n\n"
        f"Thank you,\n"
        f"{hospital_name}"
    )
    
    try:
        send_mail(
            subject,
            message,
            getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@medify.local'),
            [appointment.patient_email],
            fail_silently=False,
        )
        
        appointment.review_email_sent = True
        appointment.save(update_fields=['review_email_sent'])
        logger.info(f"Successfully sent review email to {appointment.patient_email} for appointment {appointment.id}")
        return True
    except Exception as e:
        logger.error(f"Failed to send review email for appointment {appointment.id}: {str(e)}")
        return False


def send_review_emails():
    """
    Finds appointments that were completed and sends a review email to the patient.
    """
    logger.info("Running send_review_emails job")
    
    appointments = Appointment.objects.filter(
        status__in=[Appointment.Status.CONFIRMED, 'COMPLETED'],
        review_email_sent=False
    ).exclude(patient_email="")
    
    for appointment in appointments:
        send_individual_review_email(appointment.id)

