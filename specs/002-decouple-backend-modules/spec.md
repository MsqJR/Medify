# Feature Specification: Decouple Backend Modules

**Feature Branch**: `[002-decouple-backend-modules]`

**Created**: 2026-07-18

**Status**: Draft

**Input**: User description: "we need to refactor the @[backend] to make sure modules are decoupled from each other and that inside each module no file does something it's not responsible of doing"

## Clarifications

### Session 2026-07-18

- Q: What architectural pattern should be used to decouple business-specific workspace initialization from the core registration process? → A: Custom Django signals (Observer Pattern)
- Q: Where should the chatbot routing and orchestrating logic reside to decouple the view and maintain clean responsibilities? → A: Dedicated Coordinator Service (Option B)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Decoupled Workspace Initialization (Priority: P1)

As a newly registered business owner (hospital or pharmacy), I want my workspace (including my profile and default settings) to be initialized automatically upon my registration, without the core registration process having any direct dependency on my specific business type's module.

**Why this priority**: Essential for business user onboarding and tenant creation. If this breaks, new business accounts cannot be set up.

**Independent Test**: Can be tested by executing a registration/signup request for a hospital and a pharmacy business user, verifying that the appropriate profiles are successfully initialized and templates generated, while confirming that the core platform's registration module contains zero static or compile-time dependencies on the hospital-specific or pharmacy-specific modules.

**Acceptance Scenarios**:

1. **Given** a new user signs up with the business type `hospital`, **When** the registration process completes, **Then** a hospital profile and default hospital template configurations are successfully created and linked to the website setup.
2. **Given** a new user signs up with the business type `pharmacy`, **When** the registration process completes, **Then** a pharmacy profile is successfully created and linked to the website setup.
3. **Given** the registration flow is running, **When** the workspace is initialized, **Then** the core platform code triggers the initialization through a decoupled interface (such as dynamic handlers or event notifications) and does not directly depend on or hardcode specific business profile details.

---

### User Story 2 - Decoupled Chatbot Routing (Priority: P1)

As a website visitor, I want to query the website's chatbot and receive an appropriate response (either standard medical triage or evidence-grounded pharmacy answers) according to the business type of the website, while ensuring the presentation interface does not contain orchestration or logic for generating the responses.

**Why this priority**: High priority as it affects live patient and customer interactions with the medical chatbot.

**Independent Test**: Can be tested by sending chatbot query requests to a hospital website and a pharmacy website, verifying that the hospital site returns standard triage/symptom matches and the pharmacy site returns evidence-grounded answers, while verifying that the presentation interface delegates 100% of routing and formatting to an underlying service coordinator.

**Acceptance Scenarios**:

1. **Given** a chatbot query request is received by the presentation interface, **When** the request is processed, **Then** the interface delegates the execution entirely to the unified Chatbot Service and returns the output, without orchestrating query execution or response construction directly.
2. **Given** a website of type `hospital`, **When** the unified Chatbot Service receives a query, **Then** the service processes it using the standard medical triage assistant model.
3. **Given** a website of type `pharmacy`, **When** the unified Chatbot Service receives a query, **Then** the service processes it using the evidence-grounded retrieval-augmented generation model.

---

### User Story 3 - Independent Operation of Modules (Priority: P2)

As an operator, I want each business module (such as RAG, Hospitals, or Pharmacies) to be isolated, so that disabling or modifying one module does not impact the basic operation of the core platform.

**Why this priority**: Increases reliability, maintainability, and facilitates test isolation across different micro-domains.

**Independent Test**: Can be tested by isolating or disabling specific business modules and running the core platform tests to verify that they still compile and run successfully.

**Acceptance Scenarios**:

1. **Given** the hospital module is disabled or missing, **When** a user registers, **Then** core registration completes successfully without throwing errors or dependency failures.
2. **Given** the RAG module is disabled or missing, **When** a chatbot query is sent, **Then** the system responds with a safe fallback message or default triage response rather than a server error or crash.

---

### Edge Cases

- **Missing Workspace Handler**: If a user registration is processed for an unrecognized or new business type, the system must complete the base registration safely and log a warning instead of failing or crashing.
- **Unregistered Chatbot Provider**: If a chatbot request is made for a business type that has no registered chatbot logic, the system must return a standard fallback response stating the service is temporarily unavailable.
- **Circular Dependencies**: When decoupling domain entities and services, the system must prevent circular dependency loops (e.g., ensuring all event registrations or handlers are bound dynamically at runtime).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST implement a decoupled workspace initialization mechanism using custom Django signals, where the core module dispatches a signal on signup completion and individual business modules subscribe to it to perform their respective workspace setup.
- **FR-002**: The core registration process MUST trigger workspace initialization handlers dynamically based on user business type.
- **FR-003**: The core presentation and interface layers (such as the Chatbot interface and Registration interface) MUST NOT contain business logic orchestration, provider checks, or inline result formatting.
- **FR-004**: The system MUST define a unified chatbot coordinator service (e.g. ChatbotCoordinatorService) that encapsulates the logic for inspecting the website's business type, routing chatbot queries to the corresponding model handler (standard triage or RAG), and returning a consistent response structure to the presentation layer.
- **FR-005**: All modules (Core, Hospitals, Pharmacies, RAG) MUST be architecturally decoupled, ensuring zero static or compile-time dependencies from the core module onto business-specific modules.

### Key Entities *(include if feature involves data)*

- **Workspace Initializer Registry**: A dynamic registration map that links a business type identifier to its specific workspace initialization handler.
- **Chatbot Coordinator / Service**: A unified coordinator that resolves the website's business type and routes queries to the corresponding model handler (standard triage or RAG).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The core module has zero static or compile-time dependencies on the hospital, pharmacy, or RAG modules in its source files (excluding tests).
- **SC-002**: Workspace initialization triggers correct business setup for 100% of user signups without any hardcoded checks in the core registration service.
- **SC-003**: The chatbot presentation layer delegates 100% of logic routing and result object structure formatting to the service layer.
- **SC-004**: The backend test suite passes completely.

## Assumptions

- We assume dynamic configuration registration or event signals can be utilized to handle the decoupled hooks.
- Existing database tables, schemas, and fields remain unmodified; this architectural change is behavior-neutral to the database structure.
- Tests will be written to verify that both registration and chatbot APIs behave identically from the client's perspective before and after the refactoring.
