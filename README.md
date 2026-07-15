# HireFlow AI

HireFlow AI is an autonomous hiring operating system that turns one recruiter intent into completed hiring work: resume screening, semantic ranking, interview planning, voice scheduling, interviewer briefing, feedback synthesis, decision recommendation, and candidate communication.

It is intentionally not a full ATS. It is a focused prototype designed to make AI orchestration obvious within the first minute of a live demo, which aligns with the hackathon advice to emphasize visible AI value over broad ATS surface area.

## What It Does

HireFlow AI helps small recruiting teams move from resume upload to interview decision with fewer manual handoffs. Instead of hiding intelligence behind one score, it shows a visible execution trail through specialized agents and structured outputs.

### Core workflow

1. Candidate uploads a resume.
2. Resume Agent extracts structured signals such as skills, seniority, achievements, and role fit.
3. Match Agent ranks candidates semantically against the job description and explains strengths and gaps.
4. Question Agent generates interview questions tailored to the role and candidate profile.
5. Scheduler Agent parses a natural-language command and creates the interview plan.
6. Feedback Agent synthesizes interviewer notes into structured hiring signals.
7. Decision Agent recommends the next step with confidence.

## Why It Stands Out

- **Agent-first interaction model:** The experience is framed around “Ask HireFlow,” not manual ATS data entry.
- **Recruiter command interface:** Recruiters type an intent such as `Hire a senior backend engineer with Node.js, Kafka, Redis, and distributed systems experience.`
- **Visible multi-agent execution:** Resume Agent, Match Agent, Question Agent, Scheduler Agent, Feedback Agent, Decision Agent, and Offer Agent are shown as part of the recruiting workflow.
- **Real agent timeline logs:** Every backend agent run appends a timestamped trace with agent name, model, status, duration, input preview, and output summary.
- **Embeddings-based candidate intelligence:** Candidate similarity is computed with `text-embedding-3-large` when an OpenAI key is available, with deterministic fallback scores for demos.
- **Meaningful AI outputs:** Resume parsing, semantic ranking, interview questions, scheduling entities, and recommendations are visible as structured JSON.
- **Demo-safe fallbacks:** The app works with deterministic seeded outputs even without an OpenAI API key.
- **Business value made visible:** The interface highlights recruiter workload reduction, fewer handoffs, and faster time to interview.

## Product Positioning

HireFlow AI should not be pitched as an “AI Powered ATS.” The stronger framing is an **AI Hiring Copilot for Small Companies** or a **Voice-First Recruiting Assistant**, because the hackathon guidance in the project notes says ATS is a crowded category and that better framing materially improves originality and creativity scores.

The project’s strongest differentiators are semantic resume understanding, explainable candidate fit, and natural-language interview scheduling. The notes explicitly identify those features as the parts that make the concept more hackathon-worthy than a standard ATS submission.

## Demo Flow

The recommended 3-minute demo path is:

1. Start on the landing screen with the message: **Ask once. Watch recruiting agents execute.**
2. Show impact metrics such as reduced recruiter workload, fewer handoffs, and faster time to interview.
3. Run resume screening from the candidate flow and show the parsed JSON output.
4. Open the recruiter dashboard and display the multi-agent execution trail plus real agent timeline logs.
5. Review the ranked shortlist and explainable fit summary.
6. Generate interview questions.
7. Run the Scheduling Agent with a natural-language command and confirm the interview.
8. Submit interviewer feedback and show the AI recommendation.

This sequence follows the attached hackathon recommendation to keep the demo focused on resume upload, ranking, voice scheduling, feedback, and recommendation rather than trying to showcase a large ATS route map.

## AI Architecture

HireFlow AI uses the OpenAI Agents SDK on the backend with typed JSON outputs enforced through Zod schemas.

```text
Recruiter / Candidate Input
        |
        v
Express API
        |
        v
OpenAI Agents SDK
        |
        |-- Resume Agent      -> gpt-5-mini
        |-- Match Agent       -> gpt-5
        |-- Question Agent    -> gpt-5
        |-- Scheduler Agent   -> gpt-5-mini
        |-- Feedback Agent    -> gpt-5
        |-- Decision Agent    -> gpt-5
        |-- Offer Agent       -> gpt-5-mini
        |-- Embedding Search  -> text-embedding-3-large
        |
        v
Typed JSON output via Zod schemas
        |
        v
Agent execution timeline log
```

| Agent | Default model | Purpose |
|---|---|---|
| Resume Agent | `gpt-5-mini` | Extracts skills, seniority, achievements, role signals, and projects from resume text. |
| Match Agent | `gpt-5` | Ranks candidates against the job description and explains strengths and gaps. |
| Question Agent | `gpt-5` | Generates interview questions from resume signals and job context. |
| Scheduler Agent | `gpt-5-mini` | Parses natural-language scheduling commands and recommends the best interview slot. |
| Feedback Agent | `gpt-5` | Converts interviewer notes into structured hiring signals. |
| Decision Agent | `gpt-5` | Produces the recommended next step with confidence. |

The active model plan and latest execution logs are exposed through `/api/demo` and displayed in the recruiter dashboard so judges can see the multi-model architecture and real agent activity during the live demo.

## Current Demo Scope

### Candidate flow

- Open role page for a Senior Backend Engineer position.
- Resume screening page with visible parsed JSON.
- Application status timeline after parsing and ranking.

### Recruiter flow

- Agent Command Center with quantified impact metrics.
- Recruiter Command Interface for autonomous hiring intents.
- Magical completed-work moment showing screened resumes, top candidates, interview plans, slots, briefs, and drafted outreach.
- React Flow DAG visualization for the agent workflow.
- Visible multi-agent recruiting workflow.
- Real agent execution timeline generated by backend agent calls.
- Embeddings-based candidate similarity and overlap explanations.
- Interviewer briefing packet with strengths, concerns, and focus areas.
- Ranked shortlist with semantic match scores.
- Explainable fit page with strengths and gaps.
- AI Interview Plan with Easy, Medium, and Hard questions.
- Natural-language Scheduling Agent with extracted entities, matching slots, recommendation, and execution receipt.

### Interviewer flow

- Assigned interviews view.
- Feedback submission page.
- AI next-step recommendation with reason and confidence.

## Judging Alignment

| Criterion | How HireFlow AI aligns |
|---|---|
| Originality | Reframes recruiting from a standard ATS workflow into an autonomous recruiting workflow with visible agent execution. |
| Impact | Shows reduced recruiter workload, fewer manual handoffs, and faster movement from screening to interview planning. |
| AI Fluency | Uses specialized agents, model separation between fast extraction and deeper reasoning, and typed structured outputs. |
| Working Prototype | Includes deterministic fallback mode so the product works even without live OpenAI credentials. |
| Demo Quality | Supports a compact end-to-end 3-minute story with multiple visible AI moments. |
| Creativity | Emphasizes voice-first scheduling and inspectable orchestration rather than generic automation. |

The project notes score the generic ATS framing lower and recommend this narrower HireFlow AI positioning as the stronger hackathon story.

## Tech Stack

### Frontend

- React 18.
- Vite.
- Framer Motion.
- React Flow.
- Lucide React icons.
- CSS modules via `frontend/src/styles.css`.

### Backend

- Node.js.
- Express.
- Multer for resume upload handling.
- OpenAI Agents SDK for structured agent orchestration.
- OpenAI embeddings for semantic candidate intelligence.
- Zod output schemas for typed agent responses.
- Mongoose/MongoDB optional connection.
- In-memory seeded demo state by default.

## Project Structure

```text
.
|-- backend/
|   |-- src/
|   |   |-- ai.js          # OpenAI Agents SDK orchestration and deterministic fallbacks
|   |   |-- models.js      # Optional Mongoose models
|   |   |-- seed.js        # Demo job, candidates, interviews, feedback
|   |   `-- server.js      # Express API
|   |-- .env.example
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- main.jsx       # React app and demo pages
|   |   `-- styles.css     # App styling
|   `-- package.json
|-- HireFlow-AI-3-minute-demo-script.md
|-- package.json
`-- README.md
```

## Quick Start

Install all dependencies:

```bash
npm run install:all
```

Run frontend and backend together:

```bash
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```bash
PORT=4000
MONGODB_URI=
OPENAI_API_KEY=
OPENAI_FAST_MODEL=gpt-5-mini
OPENAI_REASONING_MODEL=gpt-5
OPENAI_EMBEDDING_MODEL=text-embedding-3-large
```

### Notes

- `OPENAI_API_KEY` is optional for demos.
- If no key is provided, the backend returns deterministic fallback AI outputs.
- `OPENAI_FAST_MODEL` powers extraction agents such as resume parsing and scheduling.
- `OPENAI_REASONING_MODEL` powers matching, question generation, feedback synthesis, and hiring decisions.
- `OPENAI_EMBEDDING_MODEL` powers semantic candidate intelligence.
- `MONGODB_URI` is optional; if omitted or unavailable, the backend uses in-memory seeded state.

## API Routes

Base URL: `http://localhost:4000`

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/health` | Health check. |
| `GET` | `/api/demo` | Returns seeded demo state, active agent model plan, and latest agent execution logs. |
| `GET` | `/api/agents/logs` | Returns the latest backend agent execution timeline logs. |
| `POST` | `/api/command` | Runs the autonomous hiring operating-system workflow for a recruiter intent. |
| `POST` | `/api/candidates/search` | Runs embeddings-based candidate semantic search for an intent. |
| `GET` | `/api/jobs` | Returns the demo job. |
| `POST` | `/api/resumes` | Parses resume text or file and ranks candidates. |
| `GET` | `/api/applications` | Returns ranked candidates. |
| `GET` | `/api/applications/:id` | Returns one candidate with job context. |
| `POST` | `/api/questions` | Generates interview questions for a candidate. |
| `POST` | `/api/interviews/schedule` | Extracts scheduling entities and creates an interview. |
| `GET` | `/api/interviews` | Returns interviews. |
| `POST` | `/api/feedback` | Creates feedback and returns an AI recommendation. |

## Example API Payloads

### Parse Resume

```bash
curl -X POST http://localhost:4000/api/resumes \
  -H "Content-Type: application/json" \
  -d '{"resumeText":"John Doe is a senior backend engineer with Node.js, Kafka, Redis, Docker, AWS, and distributed systems experience."}'
```

### Generate Interview Questions

```bash
curl -X POST http://localhost:4000/api/questions \
  -H "Content-Type: application/json" \
  -d '{"candidateId":"cand-john"}'
```

### Schedule Interview

```bash
curl -X POST http://localhost:4000/api/interviews/schedule \
  -H "Content-Type: application/json" \
  -d '{"command":"Schedule John with Rahul tomorrow at 2 PM for technical round one."}'
```

### Submit Feedback

```bash
curl -X POST http://localhost:4000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"feedbackText":"Strong backend fundamentals, excellent system design understanding, and clear communication."}'
```

## Hackathon Build Scope

The attached project notes recommend not building all 28 ATS pages during the hackathon and instead focusing on the smallest high-impact surface for a 4-day build.

Recommended pages:

- Candidate login.
- Job listing.
- Resume upload.
- Application status.
- Recruiter dashboard.
- Applicants list.
- Candidate details.
- Voice scheduler.
- Interviewer assigned interviews.
- Feedback submission.

This scope is the strongest fit for the event because it keeps the demo tight and puts visible AI value in front of judges quickly.

## Build Verification

Run:

```bash
npm run build
```

Expected result:

- Vite production build succeeds.
- Framer Motion may emit `"use client"` directive warnings during bundling; these are non-blocking for this setup.

