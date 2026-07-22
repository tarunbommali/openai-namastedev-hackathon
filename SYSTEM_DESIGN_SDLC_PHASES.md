# HireFlow AI — Comprehensive 11-Phase SDLC & System Architecture
*(Production-Structured Engineering Specification • Production-Ready MVP Architecture)*

---

## Executive Summary & System Design Core Concept

In **HireFlow AI**, the fundamental System Design principles are defined as:
$$\text{HireFlow AI System} = \text{Components (React Portal + Express BFF + Redis/Mongo + CrewAI Pipeline)} + \text{Common Goal (Automated, Compliant Recruitment)}$$

System Design is the process of structuring, partitioning, and orchestrating these distributed components so the platform scales reliably from small recruitment trials to enterprise agencies handling millions of candidate applications without data cross-contamination or performance degradation.

---

## Architecture Principles

HireFlow AI adheres to 9 foundational software architecture principles:

1. **Separation of Concerns:** Rigid isolation between UI presentation, API gateway orchestration, data persistence, and AI reasoning.
2. **Single Responsibility Principle:** Each microservice, agent, middleware, and controller handles a singular, well-defined function.
3. **API-First Design:** Strict, versioned REST contracts (`/api/*` and `/v1/*`) validated by Zod and Pydantic schemas.
4. **Stateless Backend:** Express BFF nodes store no session state; authentication is fully decoupled via JWT tokens.
5. **Multi-Tenant Isolation:** Automatic header-driven query scoping (`orgId` / `tenantId`) guaranteeing zero data leaks across agencies.
6. **AI as a Decoupled Service:** The Python CrewAI pipeline operates independently behind FastAPI, exposing clean microservice endpoints.
7. **Human-in-the-Loop Governance:** AI provides decision recommendations, while recruiters retain 100% final verdict authority.
8. **Graceful Degradation:** Automatic fallbacks to Redis in-memory cache and deterministic mock engine when external dependencies (Redis/OpenAI) are unavailable.
9. **Security by Default:** Encryption at rest (AES-256-GCM), HMAC-SHA256 signed webhooks, strict RBAC authorization, and input sanitization.

---

## Technical Design Decisions & Trade-Off Rationale

### Why Express BFF (Backend-For-Frontend)?
- **Centralized Authentication & RBAC:** Protects AI microservices from direct public exposure.
- **Validation & Sanitization:** Filters and validates payloads via Zod before hitting AI models.
- **Payload Orchestration:** Combines MongoDB data with Python AI results into concise frontend responses.
- **Rate Limiting & Quota Management:** Enforces per-tenant monthly application thresholds at the gateway level.

### Why Python FastAPI & CrewAI?
- **Native AI Ecosystem:** Seamless integration with LangChain, CrewAI, Pydantic, and FAISS vector stores.
- **CrewAI Multi-Agent Pipeline:** Enables specialized autonomous agents (Resume, Match, Question, Scheduler, Feedback, Decision, Offer) to execute sequential reasoning.
- **High Performance Async Execution:** FastAPI provides high-throughput asynchronous execution for LLM network requests.

### Why MongoDB?
- **Flexible Schema Evolution:** Resumes, job descriptions, and candidate match metadata vary widely across industries.
- **Native JSON Alignment:** Perfectly mirrors JavaScript/Python JSON payloads without complex ORM translation overhead.
- **Mongoose Tenant Scoping:** Allows global query hooks to enforce `{ orgId }` filtering automatically on every database call.

### Why REST APIs?
- **Simplicity & Predictability:** Standardized HTTP verbs (`GET`, `POST`, `PATCH`, `DELETE`) simplify frontend integration and client debugging.
- **Easy Gateway Proxying:** Standardized proxy contract between Express BFF and FastAPI AI microservice.

---

# Phase 0 — Vision & Problem Definition

## Problem
Recruiters spend dozens of hours manually reading resumes, matching candidate skillsets, scheduling interviews, drafting question plans, reviewing feedback, and writing offer letters. Manual processing delays time-to-shortlist and increases candidate drop-off.

## Solution
**HireFlow AI** automates repetitive recruitment workflows using a multi-agent AI pipeline while ensuring recruiters retain full governance and final verdict authority over every key decision.

$$\text{AI Assists} \quad \mathbf{\Longleftrightarrow} \quad \text{Humans Decide}$$

## Scaling Goal
Build a modular, production-structured AI Hiring Platform that scales seamlessly across application tiers without requiring an architectural redesign:

$$100 \text{ Candidates} \quad \mathbf{\longrightarrow} \quad 10,000 \text{ Candidates} \quad \mathbf{\longrightarrow} \quad 100,000 \text{ Candidates} \quad \mathbf{\longrightarrow} \quad \text{Enterprise Scale}$$

---

# Phase 1 — Requirements Analysis

## 1.1 Functional Requirements (FR)
- **FR-01 (Authentication & RBAC):** Split registration for Companies ([registerCompany](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/controllers/authController.ts#L69)) and Candidates ([registerDeveloper](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/controllers/authController.ts#L70)) with RBAC (`candidate`, `recruiter`, `interviewer`, `company_admin`, `admin`).
- **FR-02 (Candidate Portal):** Job application with resume upload (`POST /api/candidate/apply`), status tracking, interview rescheduling (`POST /api/candidate/interviews/:id/reschedule`), and offer acceptance (`POST /api/candidate/offers/:id/respond`).
- **FR-03 (Recruiter Portal):** Job weighting customization (`POST /api/recruiter/jobs`), real-time screening (`POST /api/recruiter/screen`), question generation (`POST /api/recruiter/questions`), and human-in-the-loop decision logging (`POST /api/recruiter/decide`).
- **FR-04 (Interviewer Portal):** Assigned interview candidate queue (`GET /api/interviewer/interviews`), AI Brief access (`GET /api/interviewer/interviews/:id/brief`), and category feedback submission (`POST /api/interviewer/feedback`).
- **FR-05 (Company Admin Portal):** User management (`/api/org/users`), executive ROI reporting (`GET /api/tenant/roi-report`), and compliance bias auditing (`GET /api/compliance/bias-report`).

## 1.2 Non-Functional Requirements (NFR)
- **Sub-Second Gateway Latency:** Low overhead proxying with `@tanstack/react-query` state caching on the client.
- **Strict Multi-Tenancy:** Automated `orgIsolation` header check (`X-Tenant-ID`) preventing cross-agency data access.
- **Cost-Free Mock Fallback Mode:** Automatic switch to deterministic mock output when `OPENAI_API_KEY` is omitted.
- **Security & HMAC Signatures:** Secret encryption via AES-256-GCM and outbound HMAC-SHA256 webhook signatures (`X-HireFlow-Signature`).

---

# Phase 2 — System Architecture & Component Mapping

```text
                                React 18 Frontend SPA
                                         │
                                         │ REST API (JWT & X-Tenant-ID)
                                         ▼
                              Express Backend (BFF Gateway)
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        │                                │                                │
        ▼                                ▼                                ▼
   MongoDB Database                Redis Cache                    FastAPI Microservice
 (Multi-Tenant Collections)     (Rate Limit / Fallback)                  │
                                                                          ▼
                                                                    CrewAI Agents
                                                                          │
                                                                          ▼
                                                                  OpenAI / Mock Engine
```

## Folder Responsibility Table

| Folder Directory | File / Subfolder | Responsibility |
|---|---|---|
| `frontend/src/portals/` | `candidate`, `recruiter`, `company`, `interviewer` | Role-based dashboard interfaces & interactive UI views |
| `frontend/src/providers/` | `AppProvider`, `QueryProvider`, `AuthProvider` | Global context, React Query cache, and authentication state |
| `backend/express/src/controllers/` | [authController.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/controllers/authController.ts), [roleController.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/controllers/roleController.ts), [compatController.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/controllers/compatController.ts), [orgController.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/controllers/orgController.ts) | HTTP request handlers, input processing, and HTTP status formatting |
| `backend/express/src/middlewares/` | [authenticate.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/middlewares/authenticate.ts), [authorize.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/middlewares/authorize.ts), [orgIsolation.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/middlewares/orgIsolation.ts), [tenantQuota.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/middlewares/tenantQuota.ts) | Authentication, RBAC, tenant isolation, and quota enforcement |
| `backend/express/src/models/` | [User.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/User.ts), [Job.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Job.ts), [Candidate.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Candidate.ts), [AuditLog.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/AuditLog.ts), [ExecutionLog.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/ExecutionLog.ts) | Mongoose multi-tenant schemas & database data structures |
| `backend/python-ai/agents/` | [builders.py](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/python-ai/agents/builders.py) | Specialized CrewAI agent builders (Resume, Match, Question, etc.) |
| `backend/python-ai/crews/` | [hiring_crew.py](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/python-ai/crews/hiring_crew.py) | Orchestration crew executing multi-agent pipelines & mock fallbacks |
| `backend/python-ai/api/` | [v1.py](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/python-ai/api/v1.py) | FastAPI REST endpoints for AI microservice operations |

---

# Phase 3 — End-to-End Execution Lifecycles & Flows

## 3.1 Standard Request Lifecycle

```text
Client Request (React SPA)
       │
       ▼
JWT Bearer Token Validation (authenticate.ts)
       │
       ▼
Role Permission Check (authorize.ts)
       │
       ▼
Tenant / Org Isolation Validation (orgIsolation.ts)
       │
       ▼
Monthly Quota Check (tenantQuota.ts)
       │
       ▼
Route Controller Handler (authController / roleController / orgController)
       │
       ▼
Need AI Processing? ────► [NO] ────► Query MongoDB Database ──┐
       │                                                      │
     [YES]                                                    │
       ▼                                                      │
HTTP POST to FastAPI (/v1/*)                                  │
       │                                                      │
Execute CrewAI Agent Pipeline                                 │
       │                                                      │
Return Structured JSON Response                               │
       │                                                      │
Update Candidate & Create AuditLog ([AuditLog.ts])            │
       │                                                      │
       └──────────────────────┬───────────────────────────────┘
                              ▼
                 Return HTTP 200/201 JSON Payload
```

## 3.2 Error & Failure Handling Lifecycle

```text
Client Request
       │
       ▼
Input Payload Invalid? ────► [YES] ────► Return HTTP 400 (Zod / Schema Validation Error)
       │
      [NO]
       ▼
Quota Exceeded? ──────────► [YES] ────► Return HTTP 429 (Monthly Limit Reached)
       │
      [NO]
       ▼
Call Python AI Service
       │
   [Timeout / Network Failure / Missing API Key]
       │
       ▼
Execute Exponential Backoff Retry Engine (1s, 2s, 4s)
       │
   Still Failed?
       │
       ▼
Fallback to Deterministic Mock Engine (Cost-Free Trial Mode)
       │
       ▼
Record Error Trace in ExecutionLog ([ExecutionLog.ts])
       │
       ▼
Return Safe, Schema-Valid Response to Client
```

## 3.3 Security & Authentication Flow

```text
Recruiter Login (POST /api/auth/login)
       │
       ▼
Validate Email & Password Hash (bcrypt)
       │
       ▼
Generate Signed JWT Access Token (with userId, role, orgId)
       │
       ▼
Client attaches Token to Headers: [Authorization: Bearer <jwt>] & [X-Tenant-ID: <orgId>]
       │
       ▼
Express Middleware Pipeline:
 ├── 1. authenticate.ts   (Decodes JWT, verifies signature & expiry)
 ├── 2. authorize.ts      (Validates role matches allowed endpoint roles)
 └── 3. orgIsolation.ts   (Appends { orgId } to request context)
       │
       ▼
Mongoose Scoped Database Query (`Candidate.find({ orgId, ... })`)
```

---

# Phase 4 — Detailed Sequence Diagrams

## 4.1 Candidate Resume Screening Sequence

```text
Recruiter         React UI          Express BFF         FastAPI AI          CrewAI           MongoDB
    │                │                   │                  │                  │                │
    │── Click Screen─►│                   │                  │                  │                │
    │   Candidates   │── POST /recruiter/screen ───────────►│                  │                │
    │                │   (Job ID, Candidate IDs)            │                  │                │
    │                │                   │── Validate JWT & Org ──────────────►│                │
    │                │                   │                  │                  │                │
    │                │                   │── POST /v1/match ──────────────────►│                │
    │                │                   │   (Resume & Job Weights)            │── Run Match ──►│
    │                │                   │                  │                  │   Agent        │
    │                │                   │                  │                  │◄── Return % ───│
    │                │                   │                  │◄── Return Match ─│                │
    │                │                   │                       JSON Payload  │                │
    │                │                   │                                                      │
    │                │                   │── Update Candidate Match Scores ────────────────────►│
    │                │                   │── Write Audit Log (AuditLog.ts) ────────────────────►│
    │                │                   │                                                      │
    │                │◄── Return Scored Candidates JSON ────────────────────────────────────────│
    │◄── Render Match UI                 │
```

## 4.2 Candidate Job Application Sequence

```text
Candidate         React UI          Express BFF           MongoDB           FastAPI AI
    │                │                   │                   │                  │
    │── Submit App ─►│                   │                   │                  │
    │   & Resume     │── POST /candidate/apply ─────────────►│                  │
    │                │   (Multipart Form + Resume PDF)       │                  │
    │                │                   │                   │                  │
    │                │                   │── Parse Resume Text & Save Candidate ──►│
    │                │                   │                   │                  │
    │                │                   │── Trigger Resume Agent (/v1/parse-resume)──►│
    │                │                   │                   │                  │◄── Skills JSON
    │                │                   │── Save Candidate Application Record ────►│
    │                │                   │                   │                  │
    │                │◄── HTTP 201 Application Submitted ────│                  │
    │◄── View Status Dashboard
```

---

# Phase 5 — AI Agent Decision Pipeline & State Machine

## 5.1 Multi-Agent Crew Processing Pipeline

```text
Candidate Resume (Text / PDF)
       │
       ▼
[1. Resume Agent] ────────► Extracts Structured Skills, Experience, & Education Taxonomy
       │
       ▼
[2. Match Agent]  ────────► Computes Match % against Job Weightings (Skill/Exp/Seniority)
       │
       ▼
[3. Question Agent] ──────► Generates Tiered Technical, System Design, & Behavioral Questions
       │
       ▼
[4. Interviewer Phase] ───► Interviewer submits category ratings & feedback notes
       │
       ▼
[5. Feedback Agent] ──────► Synthesizes Interview Ratings & Summarizes Performance
       │
       ▼
[6. Decision Agent] ──────► Synthesizes Match Score + Interview Feedback ──► Verdict: [HIRE / HOLD / REJECT]
       │
       ▼
[7. Offer Agent] ─────────► Drafts Personalized Compensation & Start Date Offer Letter
```

## 5.2 Async Screening Job State Machine

```text
                    ┌─────────────────────────┐
                    │         PENDING         │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │       PROCESSING        │
                    └──────┬───────────┬──────┘
                           │           │
                 Success   │           │   Execution Error /
                 Complete  │           │   Max Retries Exceeded
                           ▼           ▼
             ┌──────────────────┐  ┌──────────────────┐
             │    COMPLETED     │  │      FAILED      │
             └──────────────────┘  └─────────┬────────┘
                                             │
                                             ▼
                                   ┌──────────────────┐
                                   │  MOCK FALLBACK   │
                                   └──────────────────┘
```

---

# Phase 6 — Database Design & Schema Mapping

| Collection Model | File Reference | Primary Fields & Multi-Tenant Scoping |
|---|---|---|
| **User** | [User.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/User.ts) | `email`, `passwordHash`, `role`, `orgId`, `tenantId` |
| **Organization** | [Organization.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Organization.ts) | `name`, `slug`, `apiKey`, `manualHoursPerBatch`, `recruiterHourlyRateUSD` |
| **Job** | [Job.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Job.ts) | `title`, `description`, `requiredSkills`, `weights` (Skill/Exp/Seniority), `orgId` |
| **Candidate** | [Candidate.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Candidate.ts) | `name`, `email`, `resumeText`, `skills`, `matchScore`, `seniorityScore`, `orgId` |
| **Application** | [Application.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Application.ts) | `candidateId`, `jobId`, `status`, `stage`, `aiSummary`, `orgId` |
| **Interview** | [Interview.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Interview.ts) | `applicationId`, `interviewerId`, `scheduledAt`, `questions`, `feedback`, `orgId` |
| **Offer** | [Offer.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Offer.ts) | `applicationId`, `candidateId`, `compensation`, `offerLetterBody`, `status`, `orgId` |
| **AuditLog** | [AuditLog.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/AuditLog.ts) | `action`, `actorId`, `targetId`, `reason`, `overrideMetadata`, `orgId` |
| **ExecutionLog** | [ExecutionLog.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/ExecutionLog.ts) | `executionId`, `agentName`, `promptTokens`, `completionTokens`, `status`, `orgId` |

---

# Phase 7 — Environment Configuration & Project Structure

## 7.1 Key Environment Variables

```text
# Express BFF Gateway Configuration
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/hireflow
JWT_SECRET=super-secret-jwt-key-hireflow-2026
REDIS_URL=redis://localhost:6379
AI_SERVICE_URL=http://localhost:8001

# Python AI Microservice Configuration
AI_PORT=8001
OPENAI_API_KEY=sk-proj-... (Omit to trigger cost-free mock fallback mode)
CREWAI_STORAGE_DIR=.crewai_storage
```

## 7.2 Complete Project Directory Tree

```text
openai-namastedev-hackathon/
├── frontend/                         # React 18 SPA Frontend (Vite + Tailwind CSS + Lucide)
│   ├── public/                       # Static public assets & favicon
│   ├── src/
│   │   ├── components/               # Standard UI Primitives (Button, Input, Card, Badge, Modal)
│   │   ├── constants/                # Navigation items, roles, & default configs
│   │   ├── hooks/                    # Custom hooks (useForm, usePagination, useDebounce, useModal)
│   │   ├── pages/                    # General pages (Landing, Login, Register, Audit, ROI)
│   │   ├── portals/                  # Role-based Portal Views (candidate, recruiter, company, interviewer)
│   │   ├── providers/                # Context Providers (App, Query, Auth, Toast, Theme)
│   │   ├── routes/                   # Router declarations (AppRoutes, ProtectedRoute)
│   │   ├── services/                 # API client services & Axios configuration
│   │   ├── App.jsx                   # Main React entry component
│   │   ├── api.js                    # Core REST API endpoint wrappers
│   │   ├── main.jsx                  # React DOM root render entrypoint
│   │   └── styles.css                # Global CSS rules & Tailwind utilities
│   ├── package.json                  # Frontend dependencies
│   └── vite.config.js                # Vite development server configuration
│
├── backend/
│   ├── express/                      # Express.js Multi-Tenant BFF Gateway
│   │   ├── src/
│   │   │   ├── clients/              # HTTP client proxy for FastAPI
│   │   │   ├── config/               # JWT secret & DB connection strings
│   │   │   ├── controllers/          # authController, roleController, orgController, compatController
│   │   │   ├── middlewares/          # authenticate, authorize, orgIsolation, tenantQuota, tenantScope
│   │   │   ├── models/               # User, Organization, Job, Candidate, Application, AuditLog, etc.
│   │   │   ├── plugins/              # Mongoose tenant query isolation plugin
│   │   │   ├── routes/               # index.ts central API router
│   │   │   ├── services/             # Business logic & Webhook dispatcher
│   │   │   ├── utils/                # AES-256-GCM encryption & Redis fallback
│   │   │   ├── app.ts                # Express application setup & middleware stack
│   │   │   └── server.ts             # HTTP server entrypoint
│   │   └── package.json              # Express dependencies
│   │
│   └── python-ai/                    # Python 3.11+ FastAPI Microservice (CrewAI Orchestrator)
│       ├── agents/                   # CrewAI Agent Builders (builders.py)
│       ├── api/                      # REST API Router (v1.py)
│       ├── crews/                    # Orchestrator Crew (hiring_crew.py)
│       ├── memory/                   # Scoped FAISS Vector Store ({tenant_id}:{job_id})
│       ├── schemas/                  # Pydantic Input/Output Schemas
│       ├── services/                 # Execution trace service & trace logging
│       ├── config.py                 # Pydantic BaseSettings & environment loader
│       ├── main.py                   # FastAPI Application Entrypoint
│       └── requirements.txt          # Python dependencies
│
├── scripts/                          # DevOps & Automation Scripts (dev-backend.sh, smoke_stack.sh)
├── Dockerfile                        # Multi-stage Docker Container Build File
├── docker-compose.yml                # Multi-container Docker Compose Orchestrator
├── package.json                      # Workspace Root package scripts (dev, test, smoke)
└── README.md                         # Executive Product Overview & Documentation
```

---

# Phase 8 — API & Response Standards

## 8.1 API Response Standard Contract

Every REST API endpoint returns a standardized JSON payload:

### Successful Response Format
```json
{
  "success": true,
  "data": {
    "candidateId": "cand_9921",
    "matchScore": 92,
    "verdict": "HIRE"
  },
  "message": "Candidate resume processed successfully",
  "timestamp": "2026-07-22T10:18:14.000Z"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "TENANT_QUOTA_EXCEEDED",
    "message": "Monthly screening quota limit reached for organization. Please upgrade your plan."
  },
  "timestamp": "2026-07-22T10:18:14.000Z"
}
```

## 8.2 Coding & Quality Standards
- **Linter & Formatter:** Strict ESLint and Prettier formatting rules across frontend and BFF backend.
- **Validation Engine:** Double-ended validation using Zod schemas on Express BFF and Pydantic schemas on FastAPI.
- **Repository Pattern:** Decoupled business logic services from direct database Mongoose query calls.

---

# Phase 9 — Monitoring, Telemetry & Observability

Observability is maintained without heavy third-party monitoring agents:

1. **Application Logs:** Structured JSON log outputs streaming to `stdout` / `stderr`.
2. **AI Execution Logs:** Detailed agent trace logs recorded in [ExecutionLog.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/ExecutionLog.ts) capturing prompt tokens, completion tokens, latency, and status.
3. **Immutable Audit Logs:** Human override verdicts permanently logged in [AuditLog.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/AuditLog.ts) with actor IDs, reasons, and metadata.
4. **AI Trace API:** FastAPI exposes `/v1/traces` and `/v1/executions/{execution_id}` for real-time AI execution inspection.

---

# Phase 10 — System Verification Matrix & Validation Strategy

The verification strategy proves that every layer of the architecture functions cleanly under runtime conditions:

## 10.1 System Verification Matrix

| Architectural Layer | Verification Method | Target Expected Result | Verification Command |
|---|---|---|---|
| **React Frontend** | Component render & route guards | All 4 role portals load without errors | `npm run dev` |
| **Authentication** | JWT login & profile retrieval | Valid token returns user profile & role | `POST /api/auth/login` |
| **RBAC Authorization** | Role-restriction testing | Candidate rejected from recruiter APIs (403) | `GET /api/recruiter/jobs` |
| **Tenant Isolation** | Cross-tenant data boundary check | Queries restricted to active `orgId` | `orgIsolation` test suite |
| **Express BFF** | Health & route integration | `/health` returns `200 OK` | `npm run test:express` |
| **Python FastAPI** | Microservice health check | `/v1/health` returns `200 OK` | `curl /v1/health` |
| **CrewAI Pipeline** | Multi-agent execution test | 7 agents execute sequentially | `pytest -q` |
| **MongoDB Persistence** | Schema validation & CRUD | Documents created with `orgId` | Mongoose integration tests |
| **Docker Compose** | Multi-container stack boot | All services containerized & healthy | `docker compose ps` |
| **End-to-End System** | Full stack smoke test script | Complete candidate hiring flow passes | `npm run smoke` |

## 10.2 System Verification Commands

```bash
# 1. Express BFF Integration Unit Tests
npm run test:express

# 2. Python AI Service Unit & Agent Tests
cd backend/python-ai && pytest -q

# 3. Full-Stack End-to-End Smoke Test Execution
npm run smoke

# 4. Container Health Status Check
docker compose ps
```

---

# Phase 11 — Assumptions & Future Scalability Roadmap

## 11.1 Current Architecture Assumptions
- Single MongoDB deployment with connection pooling.
- Single Express BFF process containerized via Docker.
- Asynchronous FastAPI Python worker processing CrewAI agent runs synchronously per request.
- Redis optional cache fallback ensuring offline trial capability.

## 11.2 Scalability Extension Roadmap

```text
Current State:
  Express BFF  ────► HTTP Proxy ────► FastAPI Microservice

Future Scalable Extension:
  Express BFF  ────► Worker Queue ────► Scaled FastAPI Worker Nodes ────► Multi-Region FAISS
```

1. **Background Job Queue:** Introduce BullMQ / Redis background workers if concurrent screening batches exceed 5,000+ candidates simultaneously, retaining exact REST API contracts.
2. **Managed Vector DB:** Transition local FAISS vector stores (`{tenant_id}:{job_id}`) to Pinecone / Qdrant for multi-region vector indexing.
3. **Enterprise SSO & Audit Export:** SAML 2.0 / Okta integration and automated compliance audit reporting for NYC Local Law 144 compliance audits.

---

*Documentation fully verified and mapped against the active HireFlow AI codebase.*
