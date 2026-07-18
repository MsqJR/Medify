from core.signals import workspace_initialized


def initialize_user_workspace(user, website_setup):
    workspace_initialized.send(
        sender=initialize_user_workspace,
        user=user,
        website_setup=website_setup,
    )
