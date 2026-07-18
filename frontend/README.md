# Medify - Medical Website Builder Frontend

A modern, high-performance Next.js 16 web application built with TypeScript and Tailwind CSS. The Medify frontend provides a professional, dashboard-driven SaaS platform that enables Hospital administrators and Pharmacy owners to build, customize, and manage their online storefronts and clinics.

---

## 🌟 Core Features

- 🏥 **Hospital Builder** - Configurable modular workspace. Set clinic schedules, structure services, build department calendars, and manage doctor profile details.
- 💊 **Pharmacy E-Commerce Workspace** - Integrated layout customizing, template marketplace, sandbox purchase activation, inventory tracking, and checkouts.
- 🤖 **AI Assistant Interface** - Dedicated chatbot workspace (`/dashboard/ai-assistant`) using specific accent styling to visually isolate the AI context from the administrative interface.
- 📁 **CSV Product Catalog Parser** - Drag-and-drop file uploader that reads and validates spreadsheet catalogs using client-side parsing before syncing backend-side.
- 💳 **Payment & Checkout Sandbox** - UI-ready billing workflows integrating Stripe and Fawry payment views.

---

## 🏗️ Project Architecture & Directory Map

```
frontend/
├── app/                      # Next.js App Router root
│   ├── [subdomain]/          # Tenant-specific published medical websites
│   │   ├── booking/          # Patient booking flow
│   │   ├── checkout/         # Medication e-commerce checkout page
│   │   ├── departments/      # Services and departments views
│   │   └── medications/      # Product/medication catalogs
│   ├── dashboard/            # Administrative dashboard shell
│   │   ├── ai-assistant/     # General dashboard AI chatbot
│   │   ├── business-info/    # Organization coordinates & mapping
│   │   ├── hospital/         # Hospital-specific administrative views
│   │   │   ├── appointments/ # Appointments and doctor calendar settings
│   │   │   ├── doctors/      # Doctor profile directory & timing grids
│   │   │   └── setup/        # Modular website setup steps
│   │   ├── pharmacy/         # Pharmacy-specific administrative views
│   │   │   ├── products/     # Catalog uploader and inventory manager
│   │   │   └── templates/    # Theme shop (purchase, active, cancel)
│   │   └── settings/         # Account password resets & deletion panel
│   ├── templates/            # Live preview folders for builders
│   ├── layout.tsx            # Global layout wrapper
│   └── globals.css           # Global stylesheets, Tailwind configuration, & themes
├── components/               # Reusable React components
│   ├── ui/                   # Custom UI controls (Button, Card, Modal, Input, etc.)
│   ├── layout/               # Topbar & sidebar navigations
│   └── LocationMapPicker.tsx # Mapping input component
├── contexts/                 # Shared React state providers (e.g., SubscriptionContext)
├── hooks/                    # Reusable React hooks
├── lib/                      # REST API client engines and utilities
│   ├── api.ts                # Base fetch client with JWT refresh interceptors
│   ├── auth.ts               # Core session auth helper
│   ├── hospitalAdminApi.ts   # CRUD requests for hospital resources
│   └── pharmacy.ts           # Pharmacy metadata and template managers
├── types/                    # TypeScript interfaces
├── middleware.ts             # Host-to-subdomain rewritings
└── package.json              # Development scripts and configuration
```

---

## 🌐 Dynamic Subdomain Rewrite (Multi-Tenancy)

Medify uses custom middleware to dynamically serve tenant websites:
1. **Intercepting Requests**: [middleware.ts](file:///home/mark/software-projects/uni/Medify_/frontend/middleware.ts) intercepts incoming requests and filters out Next.js assets (`/_next`, `/favicon.ico`) and main dashboard paths.
2. **Subdomain Mapping**: If the browser host contains a tenant subdomain (e.g. `green-clinic.localhost:3000`), the middleware rewrites the destination URL to the dynamic route `app/[subdomain]/` internally.
3. **Data Fetching**: The path `/app/[subdomain]/page.tsx` extracts the subdomain slug, requests matching setup data from the backend database, and serves the tailored page.

---

## 🛠️ Technical Stack & Key Libraries

| Dependency | Purpose | Details |
| --- | --- | --- |
| **Next.js 16 (App Router)** | Core framework & routing engine | Configured to build using **Turbopack** dev mode for speed. |
| **TypeScript 5.5+** | Compile-time safety | Strictly typed models matching Django DB models. |
| **Tailwind CSS** | Styling and responsiveness | Implements modern styling classes and theme states. |
| **Lucide React & React Icons**| SVG icon sets | Reusable visual cues. AI interfaces utilize custom icons. |
| **Leaflet** | Interactive client maps | Used in [LocationMapPicker.tsx](file:///home/mark/software-projects/uni/Medify_/frontend/components/LocationMapPicker.tsx) for pinning locations. |
| **Stripe React Wrapper** | Payment UI client | Connects payment checkout dialog boxes to stripe networks. |
| **XLSX (SheetJS)** | Client-side spreadsheet parser | Process bulk pharmacy inventories on the client side. |

---

## 🔐 Auth Token Lifecycle & Interceptors

All API communication with the Django REST API flows through the client wrapper in [lib/api.ts](file:///home/mark/software-projects/uni/Medify_/frontend/lib/api.ts):
- **Access & Refresh Tokens**: Login retrieves access (30m) and refresh (7d) tokens, stored in local storage.
- **Request Interceptor**: The base client automatically injects the `Authorization: Bearer <Access_Token>` header on all requests.
- **Expired Token Handling (HTTP 401)**: If a request fails due to an expired access token, the wrapper intercepts the response, requests a rotated token via `/api/auth/token/refresh/`, and retries the original request.
- **JWT Blacklist & Logout**: Logging out triggers a revocation request to the backend to blacklist the token, preventing re-use.

---

## 🎨 Design System & CSS Configuration

The system styling follows guidelines defined in [DESIGN.md](file:///home/mark/software-projects/uni/Medify_/DESIGN.md):
- **Typography Pairing**:
  - **Display Titles**: *Fraunces* serif font for hero segments and landing screens.
  - **Interface Labels & Body**: *Manrope* sans-serif font for dashboards and functional elements.
- **Visual Accents**:
  - **Trust Blue** (`#1B76FF`): Primary interactive elements (scarcity rules ensure this stays ≤10% of viewport area).
  - **AI Purple** (`#7C3AED`): Highlights AI-assistant modules to isolate chatbot states from regular actions.
  - **Neutral Canvas**: Chroma-0 grey canvas (`#F7F9FC`) using border outlines for flat resting cards instead of heavy shadows.

---

## 🚀 Commands & Development Scripts

Run scripts from the `frontend/` directory:

```bash
# Start development server with Turbopack compilation
npm run dev

# Lint codebase (Next.js config rules)
npm run lint

# Compile and check TypeScript types without emitting files
npx tsc --noEmit

# Compile production-ready deployment assets
npm run build

# Start production server using compiled assets
npm start

# Run frontend Jest testing suite
npm test
```

---

## 🧪 Testing Environment

Frontend testing uses **Jest** with **jsdom** configuration to test React layout modules. Test specs are located inside the `__tests__/` directory.
To execute unit tests:
```bash
npm test
```
*Note: Make sure `npx tsc --noEmit` passes clean typechecks before committing frontend changes.*
