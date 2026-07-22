# Comprehensive 11-Phase SDLC System Design & Implementation Documentation
*Applied to HireFlow AI — B2B Multi-Tenant AI Hiring Copilot*

---

## Executive Summary & System Design Core Concept

In **HireFlow AI**, the fundamental System Design principles are defined as:
$$\text{HireFlow AI System} = \text{Components (React Portal + Express BFF + Redis/Mongo + CrewAI Pipeline)} + \text{Common Goal (Automated, Compliant Recruitment)}$$

System Design is the process of structuring, partitioning, and orchestrating these distributed components so the platform scales reliably from small recruitment trials to enterprise agencies handling millions of candidate applications without data cross-contamination or performance degradation.

---

## SDLC Phase 0: System Concept & Requirements Alignment

### 0.1 Foundation & Motivation
- **Problem Statement:** Recruitment agencies burn ~16 hours per batch screening hundreds of resumes, causing candidate drop-off and delayed hiring.
- **HireFlow AI Solution:** Accelerates time-to-shortlist by 78% (down to 3.4 hrs) while providing 100% auditable human-in-the-loop decision logs and NYC Local Law 144 / EU AI Act compliance.
- **Core Directive:** *"Anyone can write code that works. System design is what makes it work for millions of candidates at once."*

### 0.2 System Classification Framework (HireFlow AI Subsystems)

HireFlow AI operates as a **Hybrid Architectural System**:

1. **Data-Intensive Subsystem:**
   - **Characteristics:** Manages massive candidate resume documents, multi-tenant usage metering, query caching, and immutable audit logs.
   - **Primary Bottlenecks:** Database read/write throughput, payload size, vector search latency across tenant namespaces.
   - **Code Implementation:**
     - MongoDB models: [Candidate.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Candidate.ts), [Job.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Job.ts), [AuditLog.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/AuditLog.ts)
     - Scoped FAISS Vector Store: `{tenant_id}:{job_id}` namespace isolation in [backend/python-ai/memory](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/python-ai/memory)
     - Client Caching: `@tanstack/react-query` in [frontend/src](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/frontend)
     - Redis / In-Memory Fallback: [redis.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/utils/redis.ts)

2. **Compute-Intensive Subsystem:**
   - **Characteristics:** Executes multi-agent CrewAI LLM reasoning chains, candidate-job vector embeddings, dynamic score calculation, and deterministic mock fallbacks.
   - **Primary Bottlenecks:** LLM API latency, context window token limits, parallel agent execution.
   - **Code Implementation:**
     - Python FastAPI Microservice: [main.py](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/python-ai/main.py)
     - 7 Specialized AI Agents: [builders.py](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/python-ai/agents/builders.py)
     - Retries & Backoff Engine: Exponential backoff (1s, 2s, 4s) helper in [backend/python-ai/utils](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/python-ai/utils)

---

## SDLC Phase 1: Functional & Non-Functional Specifications

### 1.1 Functional Requirements (FR)
- **FR-01 (Role-Based Portals):** Provide protected user interfaces for Candidate, Recruiter, Interviewer, and Company Admin users using RBAC guards in [index.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/routes/index.ts).
- **FR-02 (Bulk Import & Data Ingestion):** Ingest candidate resumes and job postings via CSV imports (`POST /api/integrations/csv/import-candidates`).
- **FR-03 (7-Agent AI Crew Pipeline):** Parse, match, design questions, schedule, analyze feedback, decide verdict, and draft offer letters using CrewAI agents.
- **FR-04 (Async Batch Screening & Polling):** Queue background batch screening jobs (`POST /api/recruiter/screen/batch-async`) and surface status via progress polling (`GET /api/recruiter/screen/job-status/:jobId`).
- **FR-05 (Outbound Webhook Dispatcher):** Dispatch HMAC-SHA256 signed event notifications (`candidate.screened`, `decision.made`, `offer.sent`).
- **FR-06 (Compliance & Bias Auditing):** Surface score distribution metrics for bias audits (`GET /api/compliance/bias-report`) and record human override verdicts in [AuditLog.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/AuditLog.ts).

### 1.2 Non-Functional Requirements (NFR)
- **NFR-01 (Strict Tenant Isolation):** Enforce zero cross-tenant data leak via header-driven scoping (`X-Tenant-ID`) in [tenantScope.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/middlewares/tenantScope.ts) and Mongoose query plugin.
- **NFR-02 (Rate Limiting & Quota Metering):** Enforce HTTP 429 rate limiting per tenant and track monthly quotas via [TenantUsage.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/TenantUsage.ts).
- **NFR-03 (Cost-Free Mock Fallback Mode):** Automatically switch to deterministic mock engine when `OPENAI_API_KEY` is omitted, returning schema-identical responses without external network dependencies.
- **NFR-04 (Security at Rest & in Transit):** Encrypt stored secrets using AES-256-GCM and verify outbound webhooks using HMAC-SHA256 signature headers (`X-HireFlow-Signature`).

---

## SDLC Phase 2: System Architectural Blueprint

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   React Frontend                                       │
│    ├── Candidate Portal (AI Disclosure Banner, Self-Serve Status, Reschedule)          │
│    ├── Recruiter Portal (Role Weighting, Human-Override UI, CSV Import/Export)         │
│    └── Company Portal (Onboarding Wizard, Quota Metering, Employee Roles, Settings)    │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ REST API, JWT Auth & X-Tenant-ID Header
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             Express BFF Multi-Tenant Gateway                           │
│    ├── Tenant Isolation Middleware (tenantScope.ts) & Query Scoping Plugin             │
│    ├── Rate Limiter & Quota Metering (TenantUsage.ts)                                  │
│    ├── Async Batch Screening Queue (ScreeningJob.ts) & Status Polling Service          │
│    ├── Webhook Dispatcher (HMAC-SHA256 Signing)                                        │
│    └── Persistence Layer (MongoDB & Redis with In-Memory Fallback)                     │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ Async Job / REST Proxy (/v1/*)
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        Python CrewAI Microservice (FastAPI)                            │
│    ├── Configurable Weighting Engine (Match & Decision Prompts)                        │
│    ├── Exponential Backoff LLM Retry Helper (1s, 2s, 4s Delays)                        │
│    ├── 7 Specialized Agents (Resume, Match, Question, Scheduler, Feedback, Decision, Offer)│
│    └── Scoped Vector Memory Store ({tenant_id}:{job_id} Namespaces)                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Architectural Evolution Mapping
| System Design Stage | Issue Handled | HireFlow AI Codebase Implementation |
|---|---|---|
| **Iteration 1: Code Optimization** | Low LLM processing efficiency | Structured JSON Pydantic contracts & cached parsing in [backend/python-ai/schemas](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/python-ai/schemas) |
| **Iteration 2: Vertical Scaling** | Memory limits on heavy candidate batches | Uvicorn worker process sizing & async node execution in [main.py](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/python-ai/main.py) |
| **Iteration 3: Horizontal Scaling** | High recruiter UI load blocking AI runs | Decoupled Express BFF Gateway ([app.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/app.ts)) from Python AI Microservice |
| **Iteration 4: Distributed Storage** | Data leak across agencies | Header-driven tenant isolation plugin ([tenantScope.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/middlewares/tenantScope.ts)) & scoped vector memory (`{tenant_id}:{job_id}`) |
| **Iteration 5: Gateway Routing & Balancer** | Server overload & unhandled spikes | Rate limiting middleware, background screening queues ([ScreeningJob.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/ScreeningJob.ts)), and mock fallback mode |

---

## SDLC Phase 3: High-Level Design (HLD) & Component Specifications

### Component 1: React 18 SPA Frontend
- **Responsibilities:** User interaction, role-based dashboards, candidate application forms, recruiter weighting configuration, ROI reports.
- **Key Modules:**
  - `AppProvider`: Combines Theme, Toast, Query, and Auth providers.
  - `ProtectedRoute`: Role-based route authorization.
  - `@tanstack/react-query`: Query caching, optimistic updates, and background refetching.

### Component 2: Express BFF (Backend For Frontend) API Gateway
- **Responsibilities:** Authentication, authorization, tenant isolation, request validation, database interactions, async batch job queuing, webhook dispatching.
- **Key Entry Points:** [app.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/app.ts), [index.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/routes/index.ts).

### Component 3: MongoDB Multi-Tenant Database
- **Responsibilities:** Persistent storage of Tenants, Users, Candidates, Jobs, Applications, Screening Jobs, Audit Logs, and Webhook subscriptions.
- **Tenant Security:** Enforced automatically by `mongooseTenantScope` plugin to append `{ tenantId }` to every query.

### Component 4: Multi-Agent Python CrewAI Microservice
- **Responsibilities:** Executes autonomous recruitment workflows through 7 specialized CrewAI agents:
  1. **Resume Agent:** Extract structured skills, experience, and education.
  2. **Match Agent:** Calculate dynamic match scores based on job role weighting.
  3. **Question Agent:** Generate tiered technical & behavioral interview questions.
  4. **Scheduler Agent:** Parse availability and coordinate interviewer slots.
  5. **Feedback Agent:** Analyze interview feedback and score categories.
  6. **Decision Agent:** Synthesize match scores + interview feedback into Hire/Reject/Hold verdicts.
  7. **Offer Agent:** Generate personalized offer letters.

### Component 5: Redis & In-Memory Fallback Cache
- **Responsibilities:** Caching JWT blacklists, tenant quota meters, and async job progress statuses. Falls back gracefully to memory when Redis is unavailable ([redis.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/utils/redis.ts)).

---

## SDLC Phase 4: Low-Level Design (LLD) & Data Flow Sequences

### 4.1 Synchronous Data Flow (e.g., Recruiter Login & Role Weight Tuning)
$$\text{React UI} \xrightarrow{\text{POST /api/auth/login}} \text{Express BFF} \xrightarrow{\text{Verify Password}} \text{MongoDB} \xrightarrow{\text{Return JWT + Role}} \text{React UI}$$

### 4.2 Asynchronous Batch Resume Screening Flow
$$\begin{array}{rccl}
1. & \text{Recruiter} & \xrightarrow{\text{POST /api/recruiter/screen/batch-async}} & \text{Express BFF} \\
2. & \text{Express BFF} & \xrightarrow{\text{Create Job (STATUS: PENDING)}} & \text{MongoDB (ScreeningJob)} \\
3. & \text{Express BFF} & \xrightarrow{\text{Return jobId instantly (202 Accepted)}} & \text{Recruiter} \\
4. & \text{Background Service} & \xrightarrow{\text{POST /v1/screen/batch}} & \text{Python CrewAI Microservice} \\
5. & \text{CrewAI Service} & \xrightarrow{\text{Run 7 Agents + Vector Memory}} & \text{Scored Candidate Results} \\
6. & \text{Express BFF} & \xrightarrow{\text{Update Candidate Scores & AuditLog}} & \text{MongoDB} \\
7. & \text{Express BFF} & \xrightarrow{\text{HMAC Webhook Dispatch (decision.made)}} & \text{External Agency ATS}
\end{array}$$

---

## SDLC Phase 5: Implementation Task & File Mapping

| Task ID | Implementation Module | File Location | Responsibility |
|---|---|---|---|
| **IMP-01** | Express BFF App Initialization | [app.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/app.ts) | Server setup, middleware attachment, route registration |
| **IMP-02** | Central API Router & RBAC | [index.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/routes/index.ts) | Endpoint definitions, authentication guards, RBAC rules |
| **IMP-03** | Tenant Scoping Middleware | [tenantScope.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/middlewares/tenantScope.ts) | Reads `X-Tenant-ID`, validates tenant context |
| **IMP-04** | Candidate Data Model | [Candidate.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Candidate.ts) | Schema definition for candidate profile, skills, AI match score |
| **IMP-05** | Job Data Model | [Job.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/Job.ts) | Job posting schema, skill weights, role criteria |
| **IMP-06** | Async Screening Job Model | [ScreeningJob.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/ScreeningJob.ts) | Background job state machine (PENDING, PROCESSING, COMPLETED, FAILED) |
| **IMP-07** | Compliance Audit Log Model | [AuditLog.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/AuditLog.ts) | Permanent record of human override verdicts and AI score audits |
| **IMP-08** | Multi-Agent AI Builder | [builders.py](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/python-ai/agents/builders.py) | Initializes CrewAI agents with dedicated prompts & tools |
| **IMP-09** | FastAPI Service Entrypoint | [main.py](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/python-ai/main.py) | REST API endpoints for CrewAI microservice (`/v1/*`) |

---

## SDLC Phase 6: Test Verification Matrix & Commands

```bash
# 1. Express BFF Integration & Unit Tests
npm run test:express

# 2. Python AI Crew Service Unit & Integration Tests
cd backend/python-ai && pytest -q

# 3. Full-Stack End-to-End Smoke Test
npm run smoke
```

### Verification Criteria Checklist
- [x] **Tenant Scoping:** Request with invalid or mismatched `X-Tenant-ID` returns HTTP 403 / 401.
- [x] **Quota Metering:** Exceeding monthly limit triggers HTTP 429 with `quota_exceeded` error payload.
- [x] **Async Job Polling:** Job status transitions deterministically: `PENDING` $\rightarrow$ `PROCESSING` $\rightarrow$ `COMPLETED`.
- [x] **Audit Traceability:** Human verdict override generates an immutable entry in [AuditLog.ts](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/backend/express/src/models/AuditLog.ts).
- [x] **Webhook Security:** Outbound webhook HTTP headers include valid `X-HireFlow-Signature` computed via HMAC-SHA256.

---

## SDLC Phase 7 to 10: Execution, Audit & Deployment

- **Phase 7 (Execution):** Express BFF & FastAPI Python Microservice codebases compiled and verified.
- **Phase 8 (E2E Verification):** Full stack smoke test (`npm run smoke`) passing end-to-end user journeys.
- **Phase 9 (Governance Audit):** Bi-annual bias audit endpoint (`GET /api/compliance/bias-report`) verified against sample distribution data for NYC Local Law 144 / EU AI Act governance.
- **Phase 10 (Production Readiness):** Containerized via Docker Compose ([docker-compose.yml](file:///c:/Users/Tarun/Downloads/openai-namastedev-hackathon/openai-namastedev-hackathon/docker-compose.yml)) for production deployment.

---

*Documentation mapped directly to the active HireFlow AI codebase.*
