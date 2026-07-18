import logging
import uuid
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.text import slugify

logger = logging.getLogger(__name__)
user_model = get_user_model()


def _generate_order_number() -> str:
    return f"ORD-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"


PHARMACY_TEMPLATE_CATALOG = {
    1: {'name': 'Modern Pharmacy', 'price': Decimal('25.00')},
    2: {'name': 'Classic Pharmacy', 'price': Decimal('20.00')},
    3: {'name': 'Minimal Pharmacy', 'price': Decimal('15.00')},
    4: {'name': 'ZenCare Pharmacy', 'price': Decimal('28.00')},
    5: {'name': 'PulsePlus Pharmacy', 'price': Decimal('24.00')},
    6: {'name': 'BloomRx Pharmacy', 'price': Decimal('22.00')},
}


def _default_subdomain(email: str) -> str:
    candidate = slugify((email or '').split('@')[0])
    return candidate or 'medify-site'


def _build_default_pharmacy_name(user) -> str:
    base_name = (getattr(user, 'name', '') or '').strip()
    return f"{base_name} Pharmacy" if base_name else 'My Pharmacy'
