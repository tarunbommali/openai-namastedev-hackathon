# HireFlow AI — Comprehensive 11-Phase SDLC Architecture & Implementation
*(Production-Structured MVP • Fully Aligned with Workspace Codebase)*

---

# Phase 0 — Vision & Problem Definition

## Problem
Recruiters spend dozens of hours manually:
- Reading and categorizing candidate resumes
- Matching candidate skillsets to job requirements
- Scheduling interview slots
- Preparing tiered technical & behavioral interview questions
- Writing structured interview feedback
- Drafting and sending candidate offer letters

As application volume scales from hundreds to thousands, manual processing delays time-to-shortlist and increases candidate drop-off.

---

## Solution
**HireFlow AI** automates repetitive recruitment workflows using a multi-agent AI pipeline while ensuring recruiters retain full governance and final verdict authority over every key decision.

$$\text{AI Assists} \quad \mathbf{\Longleftrightarrow} \quad \text{Humans Decide}$$

---

## Goal
Build a modular, production-structured AI Hiring Platform that scales seamlessly across application tiers without requiring an architectural redesign:

$$100 \text{ Candidates} \quad \mathbf{\longrightarrow} \quad 10,000 \text{ Candidates} \quad \mathbf{\longrightarrow} \quad 100,000 \text{ Candidates} \quad \mathbf{\longrightarrow} \quad \text{Enterprise Scale}$$

---

# Phase 1 — Requirements Analysis

## Functional Requirements

### 1. Authentication & Security
- Split registration endpoints for Companies ([registerCompany](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/controllers/authController.ts#L69)) and Candidates/Developers ([registerDeveloper](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/controllers/authController.ts#L70))
- Role-Based Access Control (RBAC): `candidate`, `recruiter`, `interviewer`, `company_admin`, `admin`
- Multi-Tenant Isolation via `X-Tenant-ID` header validation and `orgIsolation` middleware in [index.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/routes/index.ts#L87)

### 2. Candidate / Developer Portal
- Job browsing and application submission with resume upload (`POST /api/candidate/apply`)
- Self-serve candidate portal view (`GET /api/candidate/portal`)
- Status tracking, interview rescheduling (`POST /api/candidate/interviews/:id/reschedule`), and offer acceptance (`POST /api/candidate/offers/:id/respond`)

### 3. Recruiter Portal
- Job posting management (`POST /api/recruiter/jobs`, `PATCH /api/recruiter/jobs/:id`)
- Resume screening execution (`POST /api/recruiter/screen`) and background async batching (`POST /api/recruiter/screen/batch-async`)
- Interview question generation (`POST /api/recruiter/questions`) and slot scheduling (`POST /api/recruiter/schedule`)
- Recruiter final verdict submission (`POST /api/recruiter/decide`) with mandatory audit logging in [AuditLog.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/AuditLog.ts)

### 4. Interviewer Portal
- View assigned interview candidate queue (`GET /api/interviewer/interviews`)
- Access candidate AI brief (`GET /api/interviewer/interviews/:id/brief`)
- Submit structured interview category feedback (`POST /api/interviewer/feedback`)

### 5. Company & Administrative Portal
- Organization employee lifecycle management (`/api/org/users`, `/api/org/invite`, `/api/org/users/:id/role`)
- Executive ROI reporting (`GET /api/tenant/roi-report`) and manual baseline benchmarking (`POST /api/tenant/baseline`)
- NYC Local Law 144 / EU AI Act bias auditing (`GET /api/compliance/bias-report`)

### 6. Multi-Agent AI Crew (CrewAI)
Orchestrated in [hiring_crew.py](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/python-ai/crews/hiring_crew.py) via 7 specialized agent functions:
- `parse_resume`: Structured extraction of experience, skill taxonomy, and candidate details
- `match`: Semantic weighted matching against job criteria
- `questions`: Tiered technical, system design, and behavioral interview plan design
- `schedule`: Natural language availability parsing & interviewer slot coordination
- `feedback`: Summarizes interviewer notes & categories
- `decision`: Synthesizes match score + interview feedback into Hire / Hold / Reject
- `offer`: Drafts personalized candidate offer letters

---

## Non-Functional Requirements

- **Fast Response:** Sub-second API gateway response time; optimistic UI query caching via `@tanstack/react-query`.
- **Security at Rest & Transit:** Secret encryption via AES-256-GCM and signed webhook signatures (`X-HireFlow-Signature`).
- **Strict Tenant Isolation:** Automatic query scoping (`tenantId` / `orgId`) preventing cross-agency data leaks via `orgIsolation` middleware.
- **Modularity:** Decoupled architecture across React, Express BFF, and Python FastAPI AI microservice.
- **Graceful Cache Degradation:** Primary Redis operation with seamless in-memory fallback in [redis.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/utils/redis.ts).
- **Single-Command Containerization:** Orchestrated via [docker-compose.yml](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/docker-compose.yml).

---

# Phase 2 — System Architecture (High Level)

```text
                    React Frontend
                         │
                         │ REST API (JWT & X-Tenant-ID)
                         ▼
              Express Backend (BFF)
                         │
        ┌────────────────┼───────────────┐
        │                │               │
        ▼                ▼               ▼
    MongoDB          Redis Cache     FastAPI AI (/v1/*)
                         (Optional)      │
                                         ▼
                                    CrewAI Agents
                                         │
                                         ▼
                                 OpenAI / Mock Fallback
```

---

## Component Responsibilities

### 1. React Frontend SPA
- **Responsibilities:** Dynamic user interface, role-based routing (`AppRoutes`), state providers (`AppProvider`), query caching (`QueryProvider`).
- **Implementation:** [frontend/src](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/frontend)

### 2. Express Backend BFF API Gateway
- **Responsibilities:** Auth controllers ([authController.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/controllers/authController.ts)), Role controllers ([roleController.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/controllers/roleController.ts)), Compatibility controllers ([compatController.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/controllers/compatController.ts)), Org controllers ([orgController.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/controllers/orgController.ts)).
- **Routes Declaration:** [routes/index.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/routes/index.ts)

### 3. MongoDB Multi-Tenant Database
- **Responsibilities:** Multi-tenant document persistence.
- **Models:** 
  - [User.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/User.ts)
  - [Organization.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Organization.ts)
  - [Job.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Job.ts)
  - [Candidate.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Candidate.ts)
  - [Application.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Application.ts)
  - [Interview.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Interview.ts)
  - [Offer.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Offer.ts)
  - [ScreeningJob.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/ScreeningJob.ts)
  - [AuditLog.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/AuditLog.ts)
  - [ExecutionLog.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/ExecutionLog.ts)

### 4. Redis & In-Memory Fallback Cache
- **Responsibilities:** Fast token state management & rate limiting with in-memory fallback.
- **Implementation:** [redis.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/utils/redis.ts)

### 5. Python FastAPI Microservice
- **Responsibilities:** CrewAI agent executor, API router ([v1.py](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/python-ai/api/v1.py)), application runner ([main.py](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/python-ai/main.py)).

---

# Phase 3 — Component Design

## Frontend Layer
$$\text{React SPA} \longrightarrow \text{AppProvider} \longrightarrow \text{AppRoutes} \longrightarrow \text{Portal Components} \longrightarrow \text{React Query Hooks}$$

## Express Gateway Layer
$$\text{HTTP Request} \longrightarrow \text{authenticate / authorize / orgIsolation} \longrightarrow \text{Route Controller} \longrightarrow \text{Mongoose Service} \longrightarrow \text{MongoDB}$$

## AI Microservice Layer
$$\text{FastAPI Endpoint (/v1/*)} \longrightarrow \text{Pydantic Schema Validation} \longrightarrow \text{hiring_crew Executor} \longrightarrow \text{CrewAI Agents} \longrightarrow \text{JSON Output}$$

---

# Phase 4 — Database Design & Schema Mapping

| Collection Model | File Reference | Primary Fields & Scoping |
|---|---|---|
| **User** | [User.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/User.ts) | `email`, `passwordHash`, `role`, `orgId`, `tenantId` |
| **Organization** | [Organization.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Organization.ts) | `name`, `slug`, `apiKey`, `manualHoursPerBatch`, `recruiterHourlyRateUSD` |
| **Job** | [Job.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Job.ts) | `title`, `description`, `requiredSkills`, `weights` (Skill/Exp/Seniority), `orgId` |
| **Candidate** | [Candidate.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Candidate.ts) | `name`, `email`, `resumeText`, `skills`, `matchScore`, `seniorityScore`, `orgId` |
| **Application** | [Application.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Application.ts) | `candidateId`, `jobId`, `status`, `stage`, `aiSummary`, `orgId` |
| **Interview** | [Interview.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Interview.ts) | `applicationId`, `interviewerId`, `scheduledAt`, `questions`, `feedback`, `orgId` |
| **Offer** | [Offer.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Offer.ts) | `applicationId`, `candidateId`, `compensation`, `offerLetterBody`, `status` |
| **AuditLog** | [AuditLog.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/AuditLog.ts) | `action`, `actorId`, `targetId`, `reason`, `overrideMetadata`, `orgId` |

---

# Phase 5 — AI Workflow Design

```text
Recruiter Screen Call (`POST /api/recruiter/screen`)
           │
           ▼
Express BFF (`compatController.resumes` or `roleController.recruiterScreen`)
           │
           ▼
FastAPI Microservice (`POST /v1/parse-resume` / `POST /v1/match`)
           │
           ▼
    CrewAI hiring_crew Pipeline:
     ├── 1. parse_resume (Extract skills & experience)
     ├── 2. match (Dynamic weighted match score vs job criteria)
     ├── 3. questions (Tiered technical & behavioral plan)
     └── 4. decision (Synthesize verdict: Hire / Hold / Reject)
           │
           ▼
Structured JSON Return & Candidate Store Update
           │
           ▼
Audit Log Verification (`AuditLog.ts`) & Dashboard Refresh
```

---

# Phase 6 — Detailed API Surface Mapping

### Express BFF Endpoints (`/api/*`)
Defined in [routes/index.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/routes/index.ts):

- **Auth:**
  - `POST /api/auth/register/company`
  - `POST /api/auth/register/developer`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- **Recruiter:**
  - `GET /api/recruiter/jobs` | `POST /api/recruiter/jobs`
  - `POST /api/recruiter/screen`
  - `POST /api/recruiter/questions`
  - `POST /api/recruiter/schedule`
  - `POST /api/recruiter/decide`
- **Candidate:**
  - `GET /api/candidate/jobs`
  - `POST /api/candidate/apply`
  - `GET /api/candidate/portal`
  - `POST /api/candidate/offers/:id/respond`
- **Company Admin:**
  - `GET /api/org/me` | `PATCH /api/org/settings`
  - `GET /api/org/users` | `POST /api/org/invite`
- **Compliance & ROI:**
  - `GET /api/compliance/audit-logs`
  - `GET /api/compliance/bias-report`
  - `GET /api/tenant/roi-report`
- **Integrations:**
  - `POST /api/integrations/csv/import-candidates`
  - `POST /api/integrations/csv/import-jobs`
  - `GET /api/integrations/csv/export-screening`
  - `POST /api/integrations/webhooks`

### Python AI Service Endpoints (`/v1/*`)
Defined in [api/v1.py](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/python-ai/api/v1.py):

- `GET /v1/health`
- `POST /v1/parse-resume`
- `POST /v1/match`
- `POST /v1/questions`
- `POST /v1/schedule`
- `POST /v1/feedback`
- `POST /v1/decision`
- `POST /v1/offer`
- `POST /v1/command`
- `GET /v1/traces`

---

# Phase 7 — Project Structure

```text
openai-namastedev-hackathon/
├── frontend/                     # React 18 SPA (Vite + Tailwind + React Query)
│   ├── src/
│   │   ├── components/           # UI Components & Layouts
│   │   ├── hooks/                # Business Logic Hooks
│   │   ├── pages/                # Lazy-loaded Portal Views
│   │   ├── providers/            # Global React Context Providers
│   │   └── routes/               # AppRoutes Router Definition
├── backend/
│   └── express/                  # Express.js BFF Gateway
│       └── src/
│           ├── controllers/      # auth, role, compat, org controllers
│           ├── middlewares/      # authenticate, authorize, orgIsolation
│           ├── models/           # User, Organization, Job, Candidate, Application, AuditLog
│           ├── routes/           # index.ts central API router
│           └── services/         # Business logic services
├── backend/python-ai/            # Python 3.11+ FastAPI Microservice
│   ├── agents/                   # 7 Specialized CrewAI Builders
│   ├── api/                      # v1.py REST Router
│   ├── crews/                    # hiring_crew Orchestrator
│   ├── schemas/                  # Pydantic Input/Output Specs
│   └── main.py                   # FastAPI Application Entrypoint
├── Dockerfile                    # Multi-stage Container Build
└── docker-compose.yml            # Docker Orchestration Configuration
```

---

# Phase 8 — Implementation & Execution Flow

$$\text{React UI} \xrightarrow{\text{REST Request}} \text{Express BFF} \xrightarrow{\text{Database Operations}} \text{MongoDB}$$

$$\text{Express BFF} \xrightarrow[\text{(For AI Agent Execution)}]{\text{HTTP POST /v1/*}} \text{FastAPI Microservice} \xrightarrow{\text{CrewAI hiring_crew}} \text{Return JSON} \xrightarrow{\text{Persist Audit & Results}} \text{Update UI}$$

- **No Message Broker Overhead:** Direct synchronous integration keeping execution simple, debuggable, and performant for hackathons/MVPs.
- **Deterministic Mock Fallback:** Automatic trial mode execution if `OPENAI_API_KEY` is omitted, returning schema-identical responses with zero API costs.

---

# Phase 9 — Testing & Verification Commands

```bash
# 1. Express BFF Unit & Integration Tests
npm run test:express

# 2. Python AI Service Tests
cd backend/python-ai && pytest -q

# 3. Full-Stack End-to-End Smoke Test
npm run smoke
```

---

# Phase 10 — Deployment Configuration

Defined in [docker-compose.yml](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/docker-compose.yml):

```text
React (Static Nginx Engine) ──► Express BFF (Port 4000) ──► FastAPI AI (Port 8001) ──► MongoDB
```

---

# Phase 11 — Scalability Roadmap

1. **Performance:** Enable Redis response caching for repeated candidate match queries.
2. **Background Processing:** Integrate asynchronous background worker queues if screening batch sizes exceed 5,000+ candidates simultaneously.
3. **Enterprise Compliance:** Export NYC Local Law 144 bias audit packages directly to compliance auditors.

---

*Documentation fully synchronized with the HireFlow AI codebase.*
