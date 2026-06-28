import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medify_backend.settings')
django.setup()

from hospitals.tasks import send_review_emails
from hospitals.models import Appointment, Doctor, Department
from core.models import WebsiteSetup, User
from django.utils import timezone
from datetime import timedelta

print("Setting up test appointment...")
# Ensure a completed appointment exactly 24 hours ago
user, _ = User.objects.get_or_create(email="testtask@example.com")
ws, _ = WebsiteSetup.objects.get_or_create(user=user, subdomain="testtask")
department, _ = Department.objects.get_or_create(website_setup=ws, name="Task Department")
doctor, _ = Doctor.objects.get_or_create(website_setup=ws, department=department, name="Dr. Task")

appointment = Appointment.objects.create(
    doctor=doctor,
    website_setup=ws,
    patient_name="Task Patient",
    patient_email="taskpatient@example.com",
    start_datetime=timezone.now() - timedelta(hours=25),
    end_datetime=timezone.now() - timedelta(hours=24),
    status=Appointment.Status.CONFIRMED
)

print(f"Running send_review_emails (Should send 1 email)...")
send_review_emails()

print("Running send_review_emails again (Should skip due to review_email_sent)...")
send_review_emails()

print("Cleanup...")
appointment.delete()
doctor.delete()
department.delete()
ws.delete()
user.delete()
print("Done.")
