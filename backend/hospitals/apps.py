from django.apps import AppConfig


class HospitalsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'hospitals'

    def ready(self):
        import os
        # Avoid running scheduler multiple times (e.g. in migrations or auto-reloading runserver)
        if os.environ.get('RUN_MAIN', None) != 'true':
            return
            
        from apscheduler.schedulers.background import BackgroundScheduler
        from .tasks import send_review_emails
        
        scheduler = BackgroundScheduler()
        # Check every hour for completed appointments
        scheduler.add_job(send_review_emails, 'interval', minutes=60)
        scheduler.start()

