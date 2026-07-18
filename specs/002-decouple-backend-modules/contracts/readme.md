# Service and Event Contracts: Decouple Backend Modules

This folder documents the service signatures and event payloads that act as contract boundaries between isolated modules.

## 1. Chatbot coordinator Contract

### `ChatbotCoordinatorService.generate_response`

#### Request Parameter Contract
```python
{
    "website_setup": "core.models.WebsiteSetup (Django model instance)",
    "history": "Iterable[core.models.ChatMessage] (Django queryset/list)",
    "user_message": "str (The query text)",
    "patient_profile": "Optional[dict] (Patient context dictionary)"
}
```

#### Response Return Contract
The coordinator must return an object conforming to the `ChatbotResponse` signature defined in `core.services.chatbot.ChatbotResponse`:

```python
class ChatbotResponse:
    answer: str
    follow_up_questions: list[str]
    possible_conditions: list[str]
    recommended_specialties: list[str]
    guidance: list[str]
    urgency: str
    seek_emergency_care: bool
    confidence_note: str
    disclaimer: str
    is_medical_query: bool
    raw_model_output: str
```

---

## 2. Workspace Initialization Signal Contract

### `core.signals.workspace_initialized`

This Django signal is fired upon user registration. All listening apps must implement receivers accepting this exact signature:

```python
def receiver_callback(sender, user, website_setup, **kwargs):
    """
    Args:
        sender: The class/module that dispatched the signal
        user (core.models.User): The user instance
        website_setup (core.models.WebsiteSetup): The website setup instance
    """
```

Receivers must perform safety checks (e.g. validating `user.business_type`) before carrying out setup actions.
