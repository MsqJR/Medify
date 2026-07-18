# Implementation Plan: Decouple Backend Modules

**Branch**: `[002-decouple-backend-modules]` | **Date**: 2026-07-18 | **Spec**: [spec.md](file:///home/mark/software-projects/uni/Medify_/specs/002-decouple-backend-modules/spec.md)

**Input**: Feature specification from `/specs/002-decouple-backend-modules/spec.md`

## Summary

The backend codebase currently has cross-module dependencies that violate decoupling. Specifically, the core platform signup process (`core.services.registration`) directly imports from the hospital module to initialize a workspace, and the chatbot API view (`core.views.chatbot`) directly imports from the RAG module to orchestrate pharmacy chatbot queries. This implementation plan outlines the refactoring to isolate the modules using custom Django signals for workspace initialization and a dedicated `ChatbotCoordinatorService` for query routing.

## Technical Context

**Language/Version**: Python 3.10+

**Primary Dependencies**: Django 4.2.30, Django REST Framework 3.15.2, django-simplejwt 5.5.1, huggingface_hub

**Storage**: SQLite (db.sqlite3 for development), PostgreSQL (via psycopg in production)

**Testing**: Django test runner (`python manage.py test`)

**Target Platform**: Linux server

**Project Type**: Web service (Django / DRF backend)

**Performance Goals**: Decoupled routing must not introduce measurable execution overhead (<5ms latency difference for registration and chatbot routing).

**Constraints**:
- Zero db schema changes.
- Zero client-facing API endpoint changes (maintaining JSON schemas exactly).
- Zero compile-time or static dependencies (imports) of business modules (`hospitals`, `pharmacies`, `rag_model`) in `core` source files.

**Scale/Scope**: Refactoring affects `backend/core/services/registration.py`, `backend/core/views/chatbot.py`, and requires introducing decoupled interfaces within `backend/hospitals/` and `backend/pharmacies/`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

All principles in the constitution file are template placeholders. The refactoring adheres to standard software engineering principles:
- **Loose Coupling**: Modules interact via events/signals instead of tight imports.
- **Single Responsibility Principle**: HTTP view layer does not orchestrate business logic or model routing.

## Project Structure

### Documentation (this feature)

```text
specs/002-decouple-backend-modules/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
backend/
├── core/
│   ├── services/
│   │   ├── registration.py    # Refactored (remove hospitals import, dispatch signal)
│   │   ├── chatbot.py         # Refactored (add ChatbotCoordinatorService)
│   │   └── signals.py         # New (define custom workspace signals)
│   └── views/
│       └── chatbot.py         # Refactored (use ChatbotCoordinatorService, remove rag_model import)
├── hospitals/
│   ├── apps.py                # Refactored (register signal receiver)
│   └── signals.py             # New (signal receiver handler for hospital workspace setup)
├── pharmacies/
│   ├── apps.py                # Refactored (register signal receiver)
│   └── signals.py             # New (signal receiver handler for pharmacy workspace setup)
└── rag_model/
    └── services/
        └── rag_service.py     # Unchanged (used by Coordinator Service)
```

**Structure Decision**: Option 2 (Web application with frontend and backend projects). Refactoring is entirely inside the `backend` directory.

## Complexity Tracking

No violations of project principles.
