from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List, Set

from django.core.exceptions import ValidationError
from django.utils import timezone

from core.constants import (
    PLAN_TYPE_BASIC,
    PLAN_TYPE_STANDARD,
    PLAN_TYPE_AI,
    PLAN_TYPE_PREMIUM,
    SUBSCRIPTION_ACTIVE,
    SUBSCRIPTION_INACTIVE,
    SUBSCRIPTION_EXPIRED,
    SUBSCRIPTION_CANCELLED,
    SUBSCRIPTION_PENDING,
)

ONE_TIME_FEATURES: Set[str] = {
    'ambulance_ordering',
    'custom_theme',
}

PLAN_FEATURES = {
    PLAN_TYPE_BASIC: set(),
    PLAN_TYPE_STANDARD: {'review_system', 'ai_chatbot', 'patient_portal', 'prescription_refill'},
    PLAN_TYPE_AI: {'ai_chatbot'},
    PLAN_TYPE_PREMIUM: {
        'review_system',
        'ai_chatbot',
        'patient_portal',
        'prescription_refill',
        'ambulance_ordering',
        'custom_theme',
    },
}

THEME_FEATURE_KEYS = {
    'custom_theme': {
        'primaryColor',
        'backgroundColor',
        'fontFamily',
        'fontSize',
        'fontStyle',
        'textColor',
        'mutedTextColor',
        'surfaceColor',
        'surfaceAltColor',
        'borderColor',
        'linkColor',
        'buttonPrimaryColor',
        'buttonPrimaryTextColor',
        'buttonPrimaryHoverColor',
        'buttonSecondaryColor',
        'buttonSecondaryTextColor',
        'buttonSecondaryBorderColor',
        'buttonSecondaryHoverColor',
        'inputBackgroundColor',
        'inputBorderColor',
        'inputFocusColor',
        'borderRadius',
        'emergencyNumber',
    },
    'ai_chatbot': {'chatbotName', 'chatbotColor'},
}


@dataclass(frozen=True)
class PlanAccess:
    plan_type: str
    is_active: bool
    allowed_features: List[str]


def _normalize_plan_type(plan_type: str | None) -> str:
    if plan_type in PLAN_FEATURES:
        return plan_type
    return PLAN_TYPE_BASIC


def _normalize_one_time_features(values: Iterable[str] | None) -> List[str]:
    if not values:
        return []
    filtered = [value for value in values if value in ONE_TIME_FEATURES]
    # Preserve order while de-duplicating
    seen = set()
    unique = []
    for value in filtered:
        if value in seen:
            continue
        seen.add(value)
        unique.append(value)
    return unique


def is_subscription_active(website_setup) -> bool:
    status = getattr(website_setup, 'subscription_status', SUBSCRIPTION_INACTIVE)
    if status != SUBSCRIPTION_ACTIVE:
        return False
    ends_at = getattr(website_setup, 'subscription_ends_at', None)
    if ends_at and ends_at <= timezone.now():
        return False
    return True


def resolve_allowed_features(*, plan_type: str, subscription_status: str, subscription_ends_at, one_time_features: Iterable[str] | None) -> PlanAccess:
    normalized_plan = _normalize_plan_type(plan_type)
    active = subscription_status == SUBSCRIPTION_ACTIVE
    if subscription_ends_at and subscription_ends_at <= timezone.now():
        active = False
    allowed: Set[str] = set()
    if active:
        allowed |= PLAN_FEATURES.get(normalized_plan, set())
    allowed |= set(_normalize_one_time_features(one_time_features))
    return PlanAccess(plan_type=normalized_plan, is_active=active, allowed_features=sorted(allowed))


def get_allowed_features(website_setup) -> PlanAccess:
    return resolve_allowed_features(
        plan_type=getattr(website_setup, 'plan_type', PLAN_TYPE_BASIC),
        subscription_status=getattr(website_setup, 'subscription_status', SUBSCRIPTION_INACTIVE),
        subscription_ends_at=getattr(website_setup, 'subscription_ends_at', None),
        one_time_features=getattr(website_setup, 'one_time_features', None),
    )


def has_feature_access(website_setup, feature: str) -> bool:
    access = get_allowed_features(website_setup)
    return feature in access.allowed_features


def can_publish_hospital(website_setup) -> bool:
    access = get_allowed_features(website_setup)
    if access.is_active:
        return True
    one_time_features = getattr(website_setup, 'one_time_features', []) or []
    if one_time_features:
        return True
    # Legacy support for one-time payments stored as is_paid
    if getattr(website_setup, 'is_paid', False):
        return True
    return False


def validate_subscription_transition(instance, attrs):
    from django.utils import timezone

    subscription_fields = {'plan_type', 'subscription_status', 'subscription_ends_at'}
    if not subscription_fields.intersection(attrs.keys()):
        return attrs

    now = timezone.now()
    current_status = instance.subscription_status
    current_plan = instance.plan_type
    current_ends_at = instance.subscription_ends_at
    current_active = is_subscription_active(instance)

    incoming_status = attrs.get('subscription_status', current_status)
    incoming_plan = attrs.get('plan_type', current_plan)
    incoming_ends_at = attrs.get('subscription_ends_at', current_ends_at)

    if current_status == SUBSCRIPTION_ACTIVE and current_ends_at and current_ends_at <= now:
        current_status = SUBSCRIPTION_EXPIRED
        current_active = False

    if incoming_status == SUBSCRIPTION_ACTIVE and incoming_ends_at and incoming_ends_at <= now:
        raise ValidationError({
            'subscription_ends_at': 'Subscription end date must be in the future.'
        })

    if incoming_plan != current_plan and incoming_status in {
        SUBSCRIPTION_CANCELLED, SUBSCRIPTION_INACTIVE, SUBSCRIPTION_EXPIRED,
    }:
        raise ValidationError(
            'Cancel your current plan before subscribing to another plan.'
        )

    if current_status == SUBSCRIPTION_PENDING:
        if incoming_status in {SUBSCRIPTION_PENDING, SUBSCRIPTION_ACTIVE}:
            if incoming_plan != current_plan:
                raise ValidationError(
                    'Cancel your current plan before subscribing to another plan.'
                )
        elif incoming_status not in {SUBSCRIPTION_CANCELLED, SUBSCRIPTION_INACTIVE}:
            raise ValidationError(
                'Cancel your current plan before subscribing to another plan.'
            )

    if incoming_status == SUBSCRIPTION_PENDING:
        if current_active:
            raise ValidationError(
                'Cancel your current plan before subscribing to another plan.'
            )

    if current_active:
        if incoming_status == SUBSCRIPTION_CANCELLED and incoming_plan == current_plan:
            return attrs
        if incoming_plan == current_plan:
            raise ValidationError('You already have an active subscription.')
        raise ValidationError(
            'Cancel your current plan before subscribing to another plan.'
        )

    return attrs


def apply_subscription_update(instance, validated_data):
    from django.utils import timezone

    now = timezone.now()
    if (
        instance.subscription_status == SUBSCRIPTION_ACTIVE
        and instance.subscription_ends_at
        and instance.subscription_ends_at <= now
        and 'subscription_status' not in validated_data
    ):
        validated_data['subscription_status'] = SUBSCRIPTION_EXPIRED

    if validated_data.get('subscription_status') == SUBSCRIPTION_CANCELLED:
        validated_data.setdefault('subscription_ends_at', now)

    if 'one_time_features' in validated_data:
        incoming = validated_data['one_time_features'] or []
        existing = list(instance.one_time_features or [])
        merged = list(dict.fromkeys(existing + incoming))
        validated_data['one_time_features'] = merged

    return validated_data


def check_customization_allowed(website_setup) -> tuple[bool, str]:
    plan_access = get_allowed_features(website_setup)
    if not plan_access.is_active or plan_access.plan_type not in {PLAN_TYPE_STANDARD, PLAN_TYPE_PREMIUM}:
        return False, (
            'Website customization requires an active Premium plan. '
            'Please upgrade your subscription to save theme or logo changes.'
        )
    return True, ''


def required_theme_features(theme_settings: dict | None) -> Set[str]:
    if not theme_settings:
        return set()
    required = set()
    for feature, keys in THEME_FEATURE_KEYS.items():
        if any(key in theme_settings for key in keys):
            required.add(feature)
    return required
