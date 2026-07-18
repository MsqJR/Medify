from django.dispatch import receiver

from core.signals import workspace_initialized


@receiver(workspace_initialized)
def handle_pharmacy_workspace_init(sender, user, website_setup, **kwargs):
    if user.business_type != 'pharmacy':
        return

    from pharmacies.models import Pharmacy

    Pharmacy.objects.get_or_create(
        website_setup=website_setup,
        user=user,
        defaults={'name': f"{user.name}'s Pharmacy"},
    )
