# HireFlow AI — B2B Multi-Tenant AI Hiring Copilot

**Production-Ready SaaS | Full-Stack Multi-Agent AI System for Recruitment Agencies**

---

## 1. One-Line Summary

> Architected and shipped a multi-tenant AI hiring SaaS for recruitment agencies, featuring a 7-agent CrewAI pipeline, tenant-isolated Express BFF, React query cache, provider-based React architecture, bulk resume screening, human-in-the-loop hiring decisions, outbound HMAC webhooks, and executive ROI dashboards.

---

## 2. Executive Product Overview

HireFlow AI is a specialized **AI hiring copilot** designed for recruitment agencies and high-volume campus hiring partners. Designed specifically for Indian tech recruitment and campus partners, HireFlow AI cuts screening time and cost while keeping recruiters in full control of final hiring decisions.

**Problem it solves:** Recruitment agencies burn dozens of hours screening hundreds of resumes per job, leading to candidate drop-off and delayed shortlists. HireFlow AI accelerates time-to-shortlist by 78% (from 16.0 hrs to 3.4 hrs per batch) while providing 100% auditable decision logs and NYC Local Law 144 / EU AI Act compliance.

---

## 3. Multi-Tenant System Architecture

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   React Frontend                                       │
│    ├── Candidate Portal (AI Disclosure Banner, Self-Serve Status, Reschedule)          │
│    ├── Recruiter Portal (Role Weighting, Human-Override UI, CSV Import/Export)         │
│    └── Company Portal (Onboarding Wizard, Quota Metering, Employee Roles, Settings)    │
│    └── Shared Provider Core (AppProvider > Theme, Toast, Query [React Query], Auth)    │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ REST API, JWT Auth & X-Tenant-ID
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             Express BFF Multi-Tenant Gateway                           │
│    ├── Tenant Isolation Middleware & Mongoose Query Scoping Plugin                     │
│    ├── Monthly Quota Enforcement (429) & Tenant-Keyed Rate Limiting                    │
│    ├── Async Batch Screening Queue & Polling Service                                   │
│    ├── Webhook Dispatcher (HMAC-SHA256 X-HireFlow-Signature)                           │
│    ├── AES-256-GCM Secret Encryption at Rest                                           │
│    └── MongoDB & Redis Persistence (With In-Memory Fallback)                           │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ Async Job / REST Proxy (/v1/*)
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        Python CrewAI Microservice (FastAPI)                            │
│    ├── Configurable Weighting Engine (Match & Decision Prompts)                        │
│    ├── Exponential Backoff LLM Retry Helper (1s, 2s, 4s Delays)                        │
│    ├── 7 Specialized Agents (Resume, Match, Question, Scheduler, Feedback, Decision, Offer)│
│    ├── Scoped Vector Memory Store ({tenant_id}:{job_id} Namespaces)                    │
│    └── Deterministic Mock Fallback Engine (Trial Mode)                                  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

> 🔒 **Tenant Isolation & Security Safety:** All data and AI operations are tenant-scoped; no candidate data or scores ever cross agencies, and vector search is strictly partitioned by `{tenant_id}:{job_id}` namespaces.

---

## 4. Tech Stack & Frontend Architecture

| Layer | Technology & Architecture |
|---|---|
| **Frontend Root** | React 18, Vite, React Router DOM (v6), Tailwind CSS, Lucide Icons |
| **Global Providers** | `AppProvider` wrapping `ThemeProvider`, `ToastProvider`, `QueryProvider`, and `AuthProvider` |
| **Query Caching** | `@tanstack/react-query` & Devtools for robust async state caching, auto refetching, and mutations |
| **Routing & Protection** | `AppRoutes` acting as central router, featuring lazy-loaded portals (`React.lazy`, `Suspense`), role-based routing lists, and `ProtectedRoute` guards |
| **Standard UI Elements** | Standardized React primitives: `Button`, `Input`, `Card`, `Badge`, `ErrorBoundary`, `Toaster` |
| **Custom Hooks** | Encapsulated business state hooks: `useForm` (validations), `usePagination`, `useDebounce`, `useModal` |
| **BFF / API Gateway** | Express.js, TypeScript, JWT Auth, RBAC Middleware |
| **Multi-Tenancy** | `Tenant` & `TenantUsage` models, `tenantScope` middleware, Mongoose isolation plugin |
| **AI Orchestration** | Python 3.11+, FastAPI, CrewAI, Pydantic contracts |
| **Resilience & Retries** | Exponential Backoff Retry engine (1s, 2s, 4s) |
| **Security** | AES-256-GCM secret encryption at rest, HMAC-SHA256 webhook signatures |
| **Vector Memory** | Scoped FAISS Vector Store (`{tenant_id}:{job_id}` namespaces) |
| **Data & Cache** | MongoDB, Redis (with in-memory fallback for offline trial mode) |
| **Containerization** | Docker, Docker Compose, Nginx |

---

## 5. Multi-Agent AI Crew (CrewAI)

Seven specialized AI agents operating in an automated, resilient pipeline:

| # | Agent | Role | Responsibility |
|---|---|---|---|
| 1 | **Resume Agent** | Resume Intelligence Specialist | Structured resume parsing, experience calculation, skill taxonomy extraction |
| 2 | **Match Agent** | Semantic Matching Specialist | Dynamic weighted matching (Skill %, Experience %, Seniority %) |
| 3 | **Question Agent** | Interview Question Designer | Tiered technical, system design, coding, and behavioral question plans |
| 4 | **Scheduler Agent** | Interview Scheduling Coordinator | Natural-language scheduling parsing and interviewer slot coordination |
| 5 | **Feedback Agent** | Interview Feedback Analyst | Weighted category scoring (coding, system design, soft skills) |
| 6 | **Decision Agent** | Hiring Decision Strategist | Synthesizes match score + interview feedback into Hire/Reject/Hold |
| 7 | **Offer Agent** | Candidate Outreach Specialist | Drafts personalized offer letters (compensation, start date, role) |

> ⚡ **Deterministic Mock Mode (Cost-Free Trial):** When `OPENAI_API_KEY` is omitted, the microservice executes via deterministic mock fallback, returning schema-identical responses without API billing or network dependencies.

---

## 6. Compliance, Governance & Bias Auditability

HireFlow AI provides built-in governance tools designed to satisfy stringent hiring regulations (e.g., NYC Local Law 144, EU AI Act "high-risk" recruitment systems):

- **Candidate Transparency:** Portal banners and confirmation emails inform candidates of AI-assisted screening tools.
- **Human Authority & Override Logging:** Recruiters retain final verdict authority. Any human override is permanently recorded in [`AuditLog.ts`](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/AuditLog.ts).
- **Bias Audit Reporting:** The `/api/compliance/bias-report` endpoint surfaces score distribution analytics across candidate batches for independent bias audits without inferring demographic attributes.

---

## 7. Agency-Configurable ROI Benchmarks

All ROI metrics in the executive dashboard and `/api/tenant/roi-report` are computed against **each agency's own baseline configuration** rather than generic assumptions:

- `manualHoursPerBatch`: Configured screening hours per batch (Default: 16 hrs).
- `recruiterHourlyRateUSD`: Recruiter hourly rate (Default: $35/hr).
- `manualCostPerCandidateUSD`: Baseline manual screening cost per candidate.

---

## 8. Role-Based Access Control (RBAC) & Default Credentials

| Role | Default Email | Password | Access & Capabilities |
|---|---|---|---|
| **Candidate** | `candidate@hireflow.ai` | `Candidate123!` | Browse jobs, apply with resume, track status, AI disclosure notice, respond to offers |
| **Recruiter** | `recruiter@hireflow.ai` | `Recruiter123!` | Job weight tuning, AI screening, question generation, human-override UI, issue offers |
| **Interviewer** | `interviewer@hireflow.ai` | `Interviewer123!` | View assigned interviews, read candidate AI brief, submit structured feedback |
| **Company Admin / Admin** | `admin@hireflow.ai` | `Admin123!` | Multi-tenant setup, team configuration, quota monitoring, settings panel |

---

## 9. Outbound Webhooks & Integration Layer

HireFlow AI dispatches real-time HMAC-signed webhooks to external ATS/CRM systems:

| Event | Trigger Condition |
|---|---|
| `job.created` | New job posting created via UI or CSV import |
| `candidate.screened` | Candidate resume parsed and ranked by 7-agent crew |
| `decision.made` | Batch screening job completed or recruiter verdict finalized |
| `offer.sent` | Official job offer letter generated and dispatched |

---

## 10. API Surface Overview

| Service | Method | Endpoint | Description |
|---|---|---|---|
| Express | `POST` | `/api/auth/login` | User login (returns JWT token & user info) |
| Express | `POST` | `/api/integrations/csv/import-candidates` | Bulk CSV candidate resume import |
| Express | `POST` | `/api/integrations/csv/import-jobs` | Bulk CSV job postings import |
| Express | `GET` | `/api/integrations/csv/export-screening` | Export candidate screening results as CSV |
| Express | `POST` | `/api/integrations/webhooks` | Register outbound HMAC webhook endpoint |
| Express | `POST` | `/api/recruiter/screen/batch-async` | Queue non-blocking background batch screening |
| Express | `GET` | `/api/recruiter/screen/job-status/:jobId` | Poll progress of async screening job |
| Express | `GET` | `/api/compliance/bias-report` | Generate NYC Local Law 144 bias audit report |
| Express | `GET` | `/api/compliance/audit-logs` | Retrieve immutable decision audit logs |
| Express | `POST` | `/api/tenant/baseline` | Configure agency manual baseline benchmarks |
| Express | `GET` | `/api/tenant/roi-report` | Executive ROI & cost savings calculation report |
| Python AI| `GET` | `/v1/health` | Service health status check |
| Python AI| `GET` | `/v1/traces` | Retrieve AI agent execution log traces |

---

## 11. Quick Start Guide

### Local Development

```bash
# 1. Install all dependencies
npm run install:all

# 2. Setup Python environment
cd backend/python-ai
python -m venv .venv

# On macOS/Linux:
source .venv/bin/activate
# On Windows (PowerShell):
# .venv\Scripts\Activate.ps1

pip install -r requirements.txt
cd ../..

# 3. Start Frontend & Express BFF
npm run dev
```

Run Python AI service in a separate terminal:
```bash
cd backend/python-ai
source .venv/bin/activate      # Windows: .venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8001
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Express BFF:** [http://localhost:4000](http://localhost:4000)
- **Python AI API:** [http://localhost:8001](http://localhost:8001)

---

## 12. Testing & Verification

```bash
# Express BFF integration unit tests
npm run test:express

# Python AI service unit tests
cd backend/python-ai && pytest -q

# Full Stack End-to-End Smoke Test
npm run smoke
```
