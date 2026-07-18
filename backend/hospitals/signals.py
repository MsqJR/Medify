from django.dispatch import receiver

from core.signals import workspace_initialized


@receiver(workspace_initialized)
def handle_hospital_workspace_init(sender, user, website_setup, **kwargs):
    if user.business_type != 'hospital':
        return

    from hospitals.models.profile import HospitalProfile
    from hospitals.services.template_service import generate_default_hospital_template

    HospitalProfile.objects.get_or_create(
        website_setup=website_setup,
        defaults={'name': f"{user.name}'s Hospital"},
    )
    generate_default_hospital_template(website_setup)
