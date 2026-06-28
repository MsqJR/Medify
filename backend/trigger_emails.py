import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medify_backend.settings')
django.setup()

from hospitals.tasks import send_review_emails

print("Force-triggering the review emails task...")
send_review_emails()
print("Done. Check your console (or inbox) for any emails sent.")
