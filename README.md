# Medify - Medical Website Builder

A modern, professional SaaS platform for building medical websites for **Hospitals** and **Pharmacies**. Medify combines intuitive website construction tools with patient management portals, e-commerce storefronts, and AI-powered healthcare assistant services.

Built with **Next.js 16** (App Router, Turbopack) on the frontend, and **Django 4.2 / Django REST Framework 3.15** on the backend.

---

## 🏗️ Project Architecture & Structure

Medify is organized as a monorepo containing the following structures:

```
.
├── frontend/            # Next.js 16 application (UI / App Router)
│   ├── app/             # App routing and page templates
│   │   └── [subdomain]/ # Multi-tenancy website routing path
│   ├── components/      # Reusable UI & layout React components
│   └── package.json     # Frontend dependencies & scripts
├── backend/             # Django REST Framework API
│   ├── medify_backend/  # Main project configuration and URLs
│   ├── core/            # Authentication, onboarding, business info, & chatbot APIs
│   ├── hospitals/       # Hospital website data, doctor profiles, & bookings
│   ├── pharmacies/      # Pharmacy templates, e-commerce, & CSV inventory uploads
│   ├── rag_model/       # Standalone pharmacy RAG assistant API
│   └── requirements.txt # Python package dependencies
├── specs/               # Historical and technical specifications
├── DESIGN.md            # Platform design system tokens and visual guidelines
├── PRODUCT.md           # Product positioning, purpose, and target audiences
└── TESTING.md           # Backend and end-to-end testing suite instructions
```

### 🌐 Multi-Tenancy & Subdomain Routing

Medify supports dynamic subdomain matching for published medical websites:
- **Frontend**: A custom `middleware.ts` intercepts requests and rewrites `*.localhost:3000` to the internal path `/app/[subdomain]/`.
- **Backend**: CORS settings and security hosts validate and allow requests originating from wildcards like `*.localhost:3000`.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v20.9.0 or later)
- **Python** (v3.10 or later)
- **Docker & Docker Compose** (Optional, for quick containerized spin-up)

---

### Method A: Local Development Setup

To run both frontend and backend locally for development:

#### 1. Backend (Django API) Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Linux / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
   - **Windows (Command Prompt)**:
     ```cmd
     python -m venv venv
     venv\Scripts\activate.bat
     ```
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     venv\Scripts\Activate.ps1
     ```

3. Install requirements and upgrade package installer:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. Create configuration file from environment variables template:
   - **Linux / macOS**: `cp .env.example .env`
   - **Windows**: `copy .env.example .env`

5. Initialize the database and run migrations:
   ```bash
   python manage.py migrate
   ```

6. Start the local server:
   ```bash
   python manage.py runserver
   ```
   The backend API will run at `http://localhost:8000/api/`.

#### 2. Frontend (Next.js App) Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server with Turbopack:
   ```bash
   npm run dev
   ```
   The platform dashboard and builder will be accessible at `http://localhost:3000`.

---

### Method B: Docker Compose Setup

To launch the entire stack—including a production-ready PostgreSQL database—using Docker:

1. Create a configured `.env` file in the `backend/` folder based on `.env.example`.
2. From the root directory, build and run the services:
   ```bash
   docker-compose up --build
   ```
3. Once running:
   - **Frontend UI**: Accessible at `http://localhost:3000`
   - **Backend REST API**: Accessible at `http://localhost:8000/api/`
   - **PostgreSQL Database**: Port `5432` inside container networks

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

Configure these values for local features or production integrations:

| Variable | Default / Example | Purpose |
| --- | --- | --- |
| `SECRET_KEY` | `django-insecure-...` | Django security salt key |
| `DEBUG` | `True` | Toggle debug verbose mode |
| `DB_ENGINE` | `sqlite` or `postgresql` | Select backend database engine |
| `FRONTEND_URL` | `http://localhost:3000` | CORS trusted origin root URL |
| `HF_MEDICAL_MODEL_ID` | `microsoft/Phi-3-mini-4k-instruct` | Main model for General Chatbot |
| `HUGGINGFACE_API_TOKEN` | `hf_your_real_token...` | Token to connect to Hugging Face serverless API |
| `GEMINI_API_KEY` | `your_gemini_key...` | API key to run Gemini embed & ask for RAG |
| `GOOGLE_SERVICE_ACCOUNT_FILE` | (Path to file) | JSON path for Google Sheets sync service account |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | (Raw JSON string) | Alternate inline Google service account credentials |

*Note: For password reset email features, add standard Django `EMAIL_*` variables (e.g. `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`) to enable verification code triggers.*

### Frontend (`frontend/.env`)

| Variable | Default / Example | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | Target Django REST endpoint URL |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `(Optional Key)` | Enables interactive map locations |

---

## 🌟 Key Workflows & Features

- **🏥 Hospital Builder** - Form-based modules allow administrators to pick active features, configure department timings, list doctor profiles, and manage patient booking slots.
- **💊 Pharmacy Builder** - Interactive store generator. Includes template selection, sandbox purchase triggers, activation, cancellation workflows, and public subdomain storefronts.
- **📦 CSV Catalog Upload** - Pharmacy owners can upload entire product inventories via CSV, processed with formatting reports and error feedback, then synced bidirectionally to Google Sheets.
- **🤖 Intelligent Chatbots** - Dual AI capabilities:
  1. `/api/chatbot/`: General assistant powered by Hugging Face API to guide patients and administrators.
  2. `/api/rag/ask/`: Retrieval-Augmented Generation context engine using Gemini, query vector embeddings, and an internal fallback numpy flat index matching system.
- **🔐 Secure Auth Flows** - Advanced auth features including signup, login, JWT token blacklist rotation (revocation on single or all devices), password-reset email tokens, and account deletion with credential re-authentication.

---

## 🧪 Running Tests

To verify code correctness:

- **Backend Unit Tests**: Run `python manage.py test` inside `backend/` directory.
- **Frontend Jest Tests**: Run `npm test` inside `frontend/` directory.
- **E2E Concurrency Tests**: Run `python hospitals/tests/test_qa_e2e.py` with a live local backend running.

For detailed testing documentation, see [TESTING.md](./TESTING.md).

---

## 📖 Linked Documentation

- [DESIGN.md](./DESIGN.md) — Comprehensive visual style guide, type settings, and design principles.
- [PRODUCT.md](./PRODUCT.md) — Platform positioning, target audiences, and brand guidelines.
- [TESTING.md](./TESTING.md) — Test suite layout, coverage details, and best practices.
- [frontend/README.md](./frontend/README.md) — Frontend specific components and layouts guide.
- [AGENTS.md](./AGENTS.md) — Monorepo quick commands and architectural checklist.