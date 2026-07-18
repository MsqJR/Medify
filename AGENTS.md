# AGENTS.md — Medify

Full-stack medical website builder: **Next.js 16** (App Router, Turbopack) frontend + **Django 4.2 / DRF 3.15** backend.

## Commands

```bash
# Frontend (cd frontend)
npm run dev              # dev server :3000
npm run build && npm start
npm run lint             # next lint
npx tsc --noEmit         # typecheck
npm test                 # jest (jsdom)

# Backend (cd backend; source ~/.venv/bin/activate first)
python manage.py runserver                                # :8000
python manage.py test                                     # all tests
python manage.py test core.tests                          # single app
python manage.py test pharmacies.tests.test_views.TestClass.test_method
flake8 .                                                  # lint (E501/E221/E203 ignored per setup.cfg)
python manage.py makemigrations && python manage.py migrate
python manage.py send_review_emails                       # standalone management command
```

## Architecture

- **Monorepo**: `frontend/` (Next.js), `backend/` (Django), `myenv/` (Python venv).
- **API prefix**: `http://localhost:8000/api`.
- **JWT auth**: 30min access token, 7d refresh token, rotate+blacklist. Bearer header.
- **Multi-tenancy**: Frontend `middleware.ts` rewrites `*.localhost:3000` → `app/[subdomain]/`. Backend CORS regex allows `*.localhost:3000`.
- **Business types**: `hospital` (CRM) and `pharmacy` (e-commerce + product catalog).

### Backend URL routing

| Prefix | App |
|---|---|
| `/api/auth/*`, `/api/business-info/*`, `/api/chatbot/`, `/api/website-setups/*` | `core/` |
| `/api/pharmacy/*` | `pharmacies/` |
| `/api/hospital/*` | `hospitals/` |
| `/api/rag/ask/` | `rag_model/` (standalone RAG endpoint) |

### Key gotchas

- **No APScheduler**: Confirmation/review emails are NOT automatic. Run `python manage.py send_review_emails` via cron.
- **Google Sheets sync**: Bidirectional. Reads from sheet on list/connect, pushes after bulk upload. Share sheet with service account email as Editor. Config: `GOOGLE_SERVICE_ACCOUNT_FILE` or `GOOGLE_SERVICE_ACCOUNT_JSON`.
- **AI Chatbot**: Two endpoints — `/api/chatbot/` (business-aware, all types) and `/api/rag/ask/` (raw RAG, pharmacy only). Config: `HF_MEDICAL_MODEL_ID`, `GEMINI_API_KEY`.
- **Auth flow**: signup → login → JWT → `business-info`, `website-setups`, then product/pharmacy endpoints. Password reset + account deletion in `core/views/auth.py`.

## Testing quirks

- Backend uses Django test runner (`python manage.py test`). **No pytest**.
- `hospitals/tests/test_qa_e2e.py` requires the dev server running (`localhost:8000`).
- Standard library stubs (`backend/tests/test.py`, `test_csv_import.py`) exist but are unmaintained.
- Frontend tests in `frontend/__tests__/` run via `npm test` (jest + jsdom).

## Env

See `backend/.env.example` and `frontend/.env.example`. Database: SQLite by default (`db.sqlite3`); set `DB_ENGINE=postgresql` for PostgreSQL.

## Stale files to ignore

- `backend/.Agents/AGENTS.md` — pre-migration `api/` structure, not current.
- `backend/.Agents/MIGRATION_PLAN.md` — migration already completed.
- `backend/pharmacies/PHARMACY_GUIDE.md` and `IMPLEMENTATION_SUMMARY.md` — no longer present; pharmacy API details are in the source code.
- `backend/AGENTS.md` — speckit placeholder only.
