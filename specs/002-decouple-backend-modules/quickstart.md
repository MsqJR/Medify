# Quickstart Validation Guide: Decouple Backend Modules

This guide outlines the commands and validation scenarios required to verify that the backend modules are decoupled and function correctly.

## Prerequisites

- Python virtual environment activated:
  ```bash
  source ~/.venv/bin/activate
  ```
- Current working directory: `backend/`

---

## 1. Automated Test Execution

Run the complete test suite to ensure the refactoring has not introduced regressions.

### Run All Tests
```bash
python manage.py test
```
*Expected Outcome*: All unit and integration tests (for `core`, `hospitals`, and `pharmacies`) pass successfully.

### Run App-Specific Tests
Validate each decoupled module individually to verify isolated compilation and runtime:
```bash
python manage.py test core.tests
python manage.py test hospitals.tests
python manage.py test pharmacies.tests
```

---

## 2. Dynamic Signals Verification (Registration)

Verify that user registration triggers the correct workspace setup through custom signals.

### Validation Steps
1. Start the Django development server:
   ```bash
   python manage.py runserver 8000
   ```
2. Trigger the registration API endpoint (`POST /api/auth/signup/`) with a `hospital` user payload.
3. Query the database or endpoints to confirm:
   - A `WebsiteSetup` was created.
   - A `HospitalProfile` was automatically generated.
   - Default hospital templates were populated.
4. Trigger the registration API endpoint (`POST /api/auth/signup/`) with a `pharmacy` user payload.
5. Confirm:
   - A `WebsiteSetup` was created.
   - A `Pharmacy` profile was automatically generated.

---

## 3. Chatbot Coordinator Verification

Verify that chatbot queries are routed correctly to the triage service or the RAG service.

### Validation Steps
1. Send a chatbot query request (`POST /api/chatbot/`) targeting a `hospital` subdomain.
2. Confirm the response structure matches [ChatbotResponse](file:///home/mark/software-projects/uni/Medify_/specs/002-decouple-backend-modules/contracts/readme.md#L17-L29) and contains the diagnostic triage summary.
3. Send a chatbot query request (`POST /api/chatbot/`) targeting a `pharmacy` subdomain.
4. Confirm the response structure contains evidence-grounded answers sourced from the RAG pipeline.
5. Inspect imports to ensure `core/views/chatbot.py` contains zero references to `rag_model` packages.
