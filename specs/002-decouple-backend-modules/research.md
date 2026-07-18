# Research and Design Decisions: Decouple Backend Modules

This document details the architectural decisions and patterns evaluated during the research phase for isolating the `core`, `hospitals`, `pharmacies`, and `rag_model` Django apps.

## 1. Decoupled Workspace Initialization

### Decision
Implement custom Django signals to notify when a user signup or workspace creation completes, allowing the `hospitals` and `pharmacies` apps to initialize business-type-specific profiles independently.

### Rationale
- **Idiomatic Django Pattern**: Signals are the standard built-in mechanism in Django for implementing the Observer pattern.
- **Loose Coupling**: The `core` registration logic only dispatches the signal on signup, with no knowledge of which apps or handlers are listening.
- **Avoid Circular Imports**: Signal receivers are connected in `AppConfig.ready()`, after the Django application registry has fully loaded models and apps.
- **Local Imports**: Business-specific models and service functions are imported locally within receiver functions to prevent circular import errors.

### Alternatives Considered
- **Dynamic Registry Class**: Populating a central registry dictionary mapping business types to initializer functions at startup.
  - *Why Rejected*: More boilerplate than standard Django signals, and duplicates features already provided natively by the Django framework.
- **Settings-Driven Configuration**: Defining import path strings in Django settings.
  - *Why Rejected*: Makes settings configurations more verbose and brittle to refactoring of service file names or locations.

---

## 2. Decoupled Chatbot Routing

### Decision
Create a unified `ChatbotCoordinatorService` in the `core` service layer that dynamically routes queries to the Hugging Face triage service (`MedicalChatbotService`) or the `rag_model` service based on the tenant's business type.

### Rationale
- **Single Responsibility Principle**: Isolates the HTTP view (`ChatbotAPIView`) from orchestrating model routing and formatting.
- **No Module-Level Imports**: The coordinator service dynamically imports `ask_rag` from `rag_model.services.rag_service` locally inside the method, ensuring zero static compile-time imports of `rag_model` in the `core` app.
- **Encapsulation**: The view interacts with a single entry point, simplifying request/response schemas and testing.

### Alternatives Considered
- **Inline View Routing**: Keeping the routing inside `ChatbotAPIView` but performing a local import of RAG.
  - *Why Rejected*: Violates the separation of concerns. Views should remain simple request/response gateways and should not orchestrate business logic.
- **Dynamic Provider Registry**: Implementing a registry where apps register their chatbot handler classes.
  - *Why Rejected*: Overkill for the current scope where only two distinct handlers (triage and RAG) exist. A simple coordinator service in the service layer is cleaner and easier to maintain.
