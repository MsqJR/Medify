# Tasks: Decouple Backend Modules

**Input**: Design documents from `/specs/002-decouple-backend-modules/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included to verify that decoupled signals and routing work as expected.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- All paths are relative to the repository root.
- Python backend root: `backend/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create shared signaling structures.

- [X] T001 Create the custom signal `workspace_initialized` in `backend/core/signals.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure changes to registration before business modules can hook in.

**⚠️ CRITICAL**: T002 must be complete before User Story 1 signals can be tested.

- [X] T002 Refactor `initialize_user_workspace` in `backend/core/services/registration.py` to dispatch the `workspace_initialized` signal and remove all imports of `hospitals` modules.

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Decoupled Workspace Initialization (Priority: P1) 🎯 MVP

**Goal**: Automatically trigger workspace initialization via decoupled custom signals for hospital and pharmacy users.

**Independent Test**: Run `python manage.py test core.tests.test_decoupling` and verify registration signal receivers trigger successfully.

### Implementation for User Story 1

- [X] T003 Create the hospital receiver function `handle_hospital_workspace_init` in a new file `backend/hospitals/signals.py` to initialize hospital profile and templates.
- [X] T004 Connect the receiver to the signal in `backend/hospitals/apps.py` inside the `ready()` method.
- [X] T005 [P] [US1] Create the pharmacy receiver function `handle_pharmacy_workspace_init` in a new file `backend/pharmacies/signals.py` to initialize pharmacy profile.
- [X] T006 [US1] Connect the receiver to the signal in `backend/pharmacies/apps.py` inside the `ready()` method.
- [X] T007 [US1] Write unit tests in `backend/core/tests/test_decoupling.py` to mock-dispatch signals and assert that hospital profiles and pharmacy profiles are generated correctly.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Decoupled Chatbot Routing (Priority: P1)

**Goal**: Route chatbot queries through a dedicated service layer to decouple the presentation view from RAG orchestration.

**Independent Test**: Run `python manage.py test core.tests.test_decoupling` and verify routing routes to RAG or triage correctly.

### Implementation for User Story 2

- [X] T008 [US2] Implement `ChatbotCoordinatorService` in `backend/core/services/chatbot.py` to inspect business type, lazy-import `ask_rag` for pharmacies, and call triage for hospitals.
- [X] T009 [US2] Refactor `ChatbotAPIView` in `backend/core/views/chatbot.py` to delegate to `ChatbotCoordinatorService` and remove module-level imports of `rag_model`.
- [X] T010 [US2] Write unit tests in `backend/core/tests/test_decoupling.py` to verify routing behaves correctly for different tenant business types.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Independent Operation of Modules (Priority: P2)

**Goal**: Verify that business apps (such as RAG and Hospitals) are decoupled at the import level.

**Independent Test**: Verify zero compile-time references to `hospitals`, `pharmacies`, or `rag_model` exist in `backend/core/` source code.

### Implementation for User Story 3

- [X] T011 [US3] Audit all source files in `backend/core/` to ensure zero module-level imports of `hospitals`, `pharmacies`, or `rag_model` packages.

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify the refactoring hasn't caused regressions across the rest of the application.

- [X] T012 Run the complete backend test suite using `python manage.py test` from the `backend/` directory.
- [X] T013 Verify the manual test verification steps outlined in `specs/002-decouple-backend-modules/quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on T001 completion - blocks registration tests.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
  - US1 and US2 can proceed in parallel (separate files).
- **Polish (Final Phase)**: Depends on US1, US2, and US3 being complete.

### Parallel Opportunities

- **T005** (Pharmacy signal setup) is marked `[P]` as it has no dependencies on T003/T004 (Hospital signal setup) and operates on separate files (`backend/pharmacies/`).
- Once Phase 2 completes, User Story 1 (T003-T007) and User Story 2 (T008-T010) can be implemented in parallel.

---

## Parallel Example: User Story 1

```bash
# Launch signal receivers independently:
Task: "Create the hospital receiver in backend/hospitals/signals.py"
Task: "Create the pharmacy receiver in backend/pharmacies/signals.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1 (Workspace Signals).
4. **STOP and VALIDATE**: Verify hospital and pharmacy profile generation through signup tests.

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready.
2. Add User Story 1 -> Test signup profiles -> Deliver MVP.
3. Add User Story 2 -> Test chatbot view and coordinator routing -> Deliver chatbot refactoring.
4. Add User Story 3 -> Run static analysis/import verification -> Confirm isolation.
5. Polish -> Run entire test suite and quickstart scenarios.
