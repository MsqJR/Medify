from django.core.management.base import BaseCommand
from hospitals.tasks import send_review_emails


class Command(BaseCommand):
    help = 'Send review request emails for completed appointments'

    def handle(self, *args, **options):
        send_review_emails()
        self.stdout.write(self.style.SUCCESS('Review emails sent successfully.'))
