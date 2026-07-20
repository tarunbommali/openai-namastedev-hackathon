# HireFlow AI — CrewAI Backend

Production-oriented FastAPI backend that replaces the OpenAI Agents SDK with a real **CrewAI** multi-agent hiring crew.

The React + Vite frontend stays on the same `/api/*` contracts. Internally, every hiring step is an Agent + Task + Tool chain with retries, fallbacks, FAISS retrieval, Mongo persistence, and Redis/Celery for optional async runs.

## Architecture

```text
React (Vite + React Flow)
        |
        |  REST /api/*
        v
FastAPI
        |
        +--> HiringOrchestrator
                |
                +--> CrewAI Hiring Crew (Process.sequential)
                |       Resume -> Match -> Question -> Scheduler
                |       -> Decision -> Offer
                |
                +--> Tools (parser, embeddings, FAISS, calendar, email, mongo, memory)
                +--> FAISS vector store
                +--> MongoDB (optional) / memory fallback
                +--> Redis + Celery (optional async)
                +--> Agent execution timeline logs
```

## Agents

| Agent | Role | Task |
|---|---|---|
| Resume Agent | Resume Intelligence Specialist | Structured resume extraction |
| Match Agent | Semantic Matching Specialist | Ranking + skill gaps |
| Question Agent | Interview Question Designer | Easy/Medium/Hard/Behavioral/System Design/Coding |
| Scheduler Agent | Interview Scheduling Coordinator | NL schedule extraction |
| Feedback Agent | Interview Feedback Analyst | Strengths / weaknesses / scores |
| Decision Agent | Hiring Decision Strategist | Hire / Reject / Hold |
| Offer Agent | Candidate Outreach Specialist | Personalized outreach email |

Switch process mode with `CREW_PROCESS=sequential|hierarchical`.

## Quick start

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# optional: put OPENAI_API_KEY in .env

uvicorn app.main:app --reload --port 4000
```

Offline resilient fallback mode works **without** an API key (deterministic seeded fallbacks, same JSON shapes).

From repo root:

```bash
npm run install:all
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:4000`

## API surface

### Frontend-compatible (unchanged)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Health |
| GET | `/api/agents/logs` | Timeline traces |
| POST | `/api/command` | Full hiring OS |
| POST | `/api/resumes` | Parse + rank |
| POST | `/api/questions` | Interview plan |
| POST | `/api/interviews/preview` | Schedule preview |
| POST | `/api/interviews/schedule` | Create interview |
| POST | `/api/feedback` | Feedback → recommendation |

### Clean CrewAI routes

| Method | Path |
|---|---|
| POST | `/resume` |
| POST | `/match` |
| POST | `/questions` |
| POST | `/schedule` |
| POST | `/feedback` |
| POST | `/decision` |
| POST | `/offer` |
| POST | `/command` |
| GET | `/agents/logs` |
| GET | `/health` |

All responses are structured JSON. Free-text agent chatter is never returned to the client.

## Agent log contract

```json
{
  "id": "trace-...",
  "agent": "Resume Agent",
  "model": "gpt-5-mini",
  "status": "completed",
  "mode": "live",
  "startedAt": "2026-07-20T04:00:00Z",
  "completedAt": "2026-07-20T04:00:01Z",
  "durationMs": 820,
  "inputPreview": "...",
  "outputSummary": "7 skills extracted",
  "task": "Resume Parsing Task",
  "tokens": null
}
```

React Flow still builds its DAG client-side from these agent names.

## Docker

```bash
# from repo root
cp backend/.env.example backend/.env
docker compose up --build
```

Services: `mongo`, `redis`, `backend`, `worker`, `frontend` (nginx on `:8080`).

## Tests

```bash
cd backend
source .venv/bin/activate
pytest -q
./scripts/smoke_test.sh http://localhost:4000
```

## Sample requests

```bash
curl -X POST http://localhost:4000/api/resumes \
  -H 'Content-Type: application/json' \
  -d '{"resumeText":"John Doe, 6 years Node.js Kafka Redis AWS"}'

curl -X POST http://localhost:4000/api/command \
  -H 'Content-Type: application/json' \
  -d '{"intent":"Hire a senior backend engineer with Node.js, Kafka, Redis"}'

curl -X POST http://localhost:4000/api/interviews/schedule \
  -H 'Content-Type: application/json' \
  -d '{"command":"Schedule John tomorrow at 2 PM"}'

curl -X POST http://localhost:4000/api/feedback \
  -H 'Content-Type: application/json' \
  -d '{"feedbackText":"Strong systems thinking. Recommend hire."}'
```

## Legacy Node backend

The previous Express + OpenAI Agents SDK code remains under `backend/src/` for reference only. The live service is Python FastAPI + CrewAI under `backend/app/`.
