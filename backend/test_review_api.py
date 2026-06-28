import os
# pyrefly: ignore [missing-import]
import django
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medify_backend.settings')
django.setup()

# pyrefly: ignore [missing-import]
from django.utils.timezone import make_aware
# pyrefly: ignore [missing-import]
from django.core.signing import TimestampSigner
# pyrefly: ignore [missing-import]
from rest_framework.test import APIClient

from hospitals.models import Appointment, Doctor, Department
from core.models import WebsiteSetup, User

print("Setting up test data...")
user, _ = User.objects.get_or_create(email="testreview@example.com")
ws, _ = WebsiteSetup.objects.get_or_create(user=user, subdomain="testreview")
department, _ = Department.objects.get_or_create(website_setup=ws, name="Cardiology")
doctor, _ = Doctor.objects.get_or_create(website_setup=ws, department=department, name="Dr. Test Review")

appointment, _ = Appointment.objects.get_or_create(
    doctor=doctor,
    website_setup=ws,
    patient_name="Test Patient",
    patient_email="patient@example.com",
    start_datetime=make_aware(datetime(2025, 1, 1, 10, 0)),
    end_datetime=make_aware(datetime(2025, 1, 1, 11, 0)),
    status=Appointment.Status.CONFIRMED
)

signer = TimestampSigner()
token = signer.sign(str(appointment.id))
print(f"Token: {token}")
print(f"Appointment ID: {appointment.id}")

client = APIClient(SERVER_NAME='localhost')

print("\nTesting GET...")
response = client.get(f'/api/hospital/reviews/{token}/')
print(f"GET Status: {response.status_code}")
print(f"GET Data: {response.json()}")

print("\nTesting POST (Valid)...")
post_data = {
    "rating": 5,
    "comment": "Great doctor!"
}
response = client.post(f'/api/hospital/reviews/{token}/', post_data, format='json')
print(f"POST Status: {response.status_code}")
print(f"POST Data: {response.json()}")

print("\nTesting POST (Duplicate)...")
response = client.post(f'/api/hospital/reviews/{token}/', post_data, format='json')
print(f"POST Duplicate Status: {response.status_code}")
print(f"POST Duplicate Data: {response.json()}")

print("\nTesting POST (Invalid Token)...")
response = client.post(f'/api/hospital/reviews/invalid_token/', post_data, format='json')
print(f"POST Invalid Token Status: {response.status_code}")
print(f"POST Invalid Token Data: {response.json()}")

print("\nCleanup...")
appointment.delete()
doctor.delete()
department.delete()
ws.delete()
user.delete()
print("Done.")
