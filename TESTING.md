# Medify Backend Test Suite Guide

Welcome to the Medify testing documentation. This guide outlines the test structure, how to execute tests, and best practices for writing new tests for the Django backend.

---

## 1. Django Unit Tests

These tests verify database schemas, serializers, viewsets, authentication flows, CSV processing, and payment integrations (Stripe, Fawry webhook verification, Google Sheets sync, etc.).

### Run All Tests
Execute all unit tests from the `backend/` directory:
```bash
python manage.py test
```

### Targeted Test Runs
You can run specific applications, test files, classes, or individual test methods to speed up feedback loops:

- **Run only the `core` app tests**:
  ```bash
  python manage.py test core.tests
  ```
- **Run only the `pharmacies` app tests**:
  ```bash
  python manage.py test pharmacies.tests
  ```
- **Run only the `hospitals` app tests**:
  ```bash
  python manage.py test hospitals.tests
  ```
- **Run only the `rag_model` app tests**:
  ```bash
  python manage.py test rag_model.tests
  ```
- **Run a specific test file**:
  ```bash
  python manage.py test pharmacies.tests.test_orders
  ```
- **Run a specific test class**:
  ```bash
  python manage.py test pharmacies.tests.test_views.TestClass
  ```
- **Run a single test method**:
  ```bash
  python manage.py test pharmacies.tests.test_views.TestClass.test_method
  ```

---

## 2. QA / Concurrency End-to-End Test Suite

The QA script (`backend/tests/qa_test.py`) runs functional, concurrency, and validation tests against a live, running backend server.

### Prerequisites
Ensure your local backend development server is running in the background:
```bash
python manage.py runserver
```
*(Ensure it is bound to the default address `127.0.0.1:8000`)*

### Execution
Run the QA script directly:
```bash
python tests/qa_test.py
```

### What it Tests
- **Public APIs**: Verifies retrieves for hospital pages, doctor lists, and department schedules.
- **Slot Engine**: Validates working day/non-working day availability slot counts.
- **Booking Flow**: Tests standard appointment booking and verifies that double bookings fail with correct HTTP status codes.
- **Concurrency Test**: Fires parallel threads to attempt booking the same slot simultaneously, ensuring database concurrency locks function.
- **Malformed Input**: Validates how the server handles invalid payloads (e.g. malformed JSON).

---

## 3. Test Coverage Map

### Core App Tests (`backend/core/tests/`)
- `test_auth.py`: Standard sign-up, sign-in, JWT generation, password resets, and account deletion.
- `test_google_auth.py`: OAuth flow handlers.
- `test_onboarding.py`: Multi-tenant website onboarding and registration.
- `test_business_location.py`: Business info validation and coordinates mapping.
- `test_chatbot.py`: Chatbot API endpoints, settings, plan gating, and cache-based rate limits.

### Hospital App Tests (`backend/hospitals/tests/`)
- `test_doctors.py`: CRUD for doctors, schedules, and active statuses.
- `test_booking.py`: Patient appointments creation, slot allocation, and email triggers.
- `test_photos.py`: Uploading and managing doctor profile photos.

### Pharmacy App Tests (`backend/pharmacies/tests/`)
- `test_orders.py`: Product purchases, cart validation, order generation, and inventory reduction.
- `test_csv_upload.py`: Bulk uploading product catalogs via CSV, parser errors, and formatting alerts.
- `test_templates.py`: Selection, activation, and management of pharmacy templates.
- `test_payments.py`: Checkout webhooks and payment gateways (Stripe, Fawry webhook verification).
- `test_google_sheet.py`: Google Sheets spreadsheet URL and GID parsing.

### RAG Model Tests (`backend/rag_model/tests/`)
- `test_vector_store.py`: Document vectors addition, search matching, and fallback numpy matrix Flat index.

---

## 4. Best Practices for Writing Backend Tests

- **Clean Environments**: Django unit tests run against a separate, temporary database. Avoid relying on existing records in your local development database.
- **Mocking External Services**: When writing tests for third-party integrations (Google Sheets, Stripe, Fawry, AI Chatbot models), always mock HTTP requests using `unittest.mock.patch` or library mocks.
- **Signal Control**: Disable or mock heavy side-effects (like sending confirmation emails) in unit tests using Django’s `override_settings` or standard mocking tools to speed up performance.
- **Database Locks**: When building or updating critical endpoints (e.g. booking slots, product checkout), utilize Django’s `select_for_update()` to prevent race conditions, and write tests that specifically assert database lock behavior.
