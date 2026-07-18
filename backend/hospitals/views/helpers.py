import logging
import uuid

from django.core.files.base import ContentFile
import urllib.request

from core.models import WebsiteSetup


logger = logging.getLogger(__name__)


def _get_or_create_website_setup(user):
    website_setup, _ = WebsiteSetup.objects.get_or_create(
        user=user,
        defaults={'subdomain': f"{user.email.split('@')[0]}-hospital" if user.email else "my-hospital"}
    )
    return website_setup


def download_image_to_filefield(image_url):
    if not image_url or not isinstance(image_url, str):
        return None
    image_url = image_url.strip()
    if not (image_url.startswith('http://') or image_url.startswith('https://')):
        return None
    try:
        req = urllib.request.Request(
            image_url,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            content_type = response.headers.get('Content-Type', '')
            if 'image' not in content_type.lower():
                return None

            ext = 'jpg'
            if 'png' in content_type.lower():
                ext = 'png'
            elif 'gif' in content_type.lower():
                ext = 'gif'
            elif 'webp' in content_type.lower():
                ext = 'webp'

            filename = f"doctor_{uuid.uuid4().hex}.{ext}"
            return ContentFile(response.read(), name=filename)
    except Exception as e:
        logger.error(f"Failed to download image from {image_url}: {e}")
        return None
