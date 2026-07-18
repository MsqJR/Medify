import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken


logger = logging.getLogger(__name__)


def build_password_reset_url(uid: str, token: str) -> str:
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000').rstrip('/')
    reset_path = getattr(settings, 'FRONTEND_PASSWORD_RESET_PATH', '/reset-password')
    if not reset_path.startswith('/'):
        reset_path = f'/{reset_path}'
    return f'{frontend_url}{reset_path}?uid={uid}&token={token}'


def get_user_from_uid(uid: str):
    user_model = get_user_model()
    try:
        decoded_uid = force_str(urlsafe_base64_decode(uid))
        return user_model.objects.get(pk=decoded_uid, is_active=True)
    except (TypeError, ValueError, OverflowError, user_model.DoesNotExist):
        return None


def blacklist_all_tokens_for_user(user):
    for outstanding_token in OutstandingToken.objects.filter(user=user):
        BlacklistedToken.objects.get_or_create(token=outstanding_token)


def blacklist_single_refresh_token(refresh_token: str, user):
    try:
        token = RefreshToken(refresh_token)
    except TokenError:
        return False, 'Invalid or expired refresh token.'

    if str(token.get('user_id')) != str(user.pk):
        return False, 'Refresh token does not belong to the authenticated user.'

    try:
        token.blacklist()
    except TokenError as exc:
        if 'blacklisted' in str(exc).lower():
            return True, None
        return False, 'Invalid or expired refresh token.'

    return True, None
