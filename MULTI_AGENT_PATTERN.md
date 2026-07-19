# HireFlow AI: Multi-Agent Pattern

## Purpose

HireFlow AI uses a **multi-agent orchestration pattern** to turn one recruiting request into a sequence of focused hiring tasks. Instead of one general-purpose assistant producing every answer, an orchestrator assigns each task to the specialist best suited to it, combines the outputs, and returns one completed hiring workflow.

This pattern is used for the project's recruiter command, resume screening, candidate matching, interview planning, scheduling, feedback analysis, and candidate outreach.

## Why Multi-Agent

A hiring workflow contains distinct forms of work: extracting facts from a resume, evaluating role fit, designing questions, interpreting scheduling language, and recommending a decision. Separating those tasks gives the product:

- Clear responsibilities for each AI component.
- Model selection appropriate to the task's complexity.
- Typed, inspectable outputs instead of unstructured text.
- A visible execution trail for recruiters and demo judges.
- Graceful demo operation when live AI credentials are unavailable.

## Architecture

```text
Recruiter intent or candidate input
                |
                v
        Express API endpoint
                |
                v
  Hiring workflow orchestrator (ai.js)
                |
     +----------+-----------+-----------+-----------+-----------+
     |          |           |           |           |           |
     v          v           v           v           v           v
Embedding   Resume       Match       Question    Scheduler   Briefing /
Search      Agent        Agent       Agent       Agent       Offer helpers
     |          |           |           |           |           |
     +----------+-----------+-----------+-----------+-----------+
                |
                v
    Typed JSON results, timeline logs, API response
                |
                v
            React dashboard
```

The implementation uses a **centralized orchestrator**, not free-form agent-to-agent conversation. The orchestrator controls task order, passes only the context each specialist needs, and builds the final result. This keeps the demo predictable, easier to observe, and safer to extend.

## Agents and Responsibilities

| Component | Default model | Input | Structured output | Responsibility |
|---|---|---|---|---|
| Embedding Search | `text-embedding-3-large` | Recruiter intent and candidate profiles | Similarity-ranked candidates | Finds candidates with semantic overlap to the requested role. |
| Resume Agent | `gpt-5-mini` | Resume text | Skills, seniority, experience, achievements, role signals, and projects | Converts an unstructured resume into a recruiting profile. |
| Match Agent | `gpt-5` | Job, parsed resume, and candidates | Rankings, match scores, strengths, gaps, and confidence | Evaluates explainable fit against the open role. |
| Question Agent | `gpt-5` | Candidate and job | Easy, medium, and hard interview questions with signals | Produces a tailored interview plan. |
| Scheduler Agent | `gpt-5-mini` | Natural-language scheduling command | Candidate, interviewer, round, duration, slots, and recommendation | Extracts scheduling entities and recommends an interview slot. |
| Decision Agent | `gpt-5` | Interviewer feedback | Recommendation, reason, and confidence | Synthesizes feedback into the recommended next step. |
| Briefing / Offer helpers | Configured fast or reasoning model | Workflow context | Interviewer brief and outreach draft | Completes the recruiter-facing workflow and logs the work performed. |

## Main Orchestrated Workflow

The recruiter command endpoint, `POST /api/command`, calls `runHiringOperatingSystem(intent)` in `backend/src/ai.js`.

1. **Discover** — Embedding Search compares the recruiter intent to candidate profiles and identifies the strongest semantic match.
2. **Understand** — Resume Agent extracts a consistent candidate profile from the selected resume.
3. **Evaluate** — Match Agent ranks the candidate set against the job and explains each score.
4. **Prepare** — Question Agent creates a role- and candidate-specific interview plan.
5. **Coordinate** — Scheduler Agent turns a scheduling instruction into a proposed interview time.
6. **Package** — The workflow creates an interviewer briefing packet and candidate outreach draft.
7. **Expose** — The API returns completed actions, rankings, scheduling details, the briefing, outreach, and the agent execution log.

```text
intent
  -> semantic candidate search
  -> selected candidate resume parsing
  -> candidate ranking
  -> interview-question generation
  -> schedule extraction
  -> interviewer brief + outreach draft
  -> completed workflow response
```

## Output Contracts and Reliability

The Resume, Match, Question, Scheduler, and Decision agents use Zod schemas as output contracts. Each agent is expected to return fields the rest of the application can safely consume, such as `rankings`, `questions`, `recommendedSlot`, or `recommendation`.

`runAgent()` is the shared execution wrapper. It:

1. Runs the OpenAI Agents SDK agent when `OPENAI_API_KEY` is configured.
2. Captures the final typed output.
3. Records the agent, model, timing, status, input preview, and output summary.
4. Uses a deterministic fallback if credentials are absent or a live call fails.

This fallback mode means the hackathon demo still shows the full multi-agent workflow without depending on an external API connection.

## Visibility and Observability

Every agent run is added to the in-memory execution timeline. Each trace includes:

- Agent name and model.
- Status and execution mode (`live`, `demo`, `error`, or `orchestrated`).
- Start time, completion time, and duration.
- A short input preview and output summary.

The frontend reads these traces through `GET /api/demo` and `GET /api/agents/logs`, making orchestration visible in the recruiter dashboard rather than hiding it behind a single answer.

## Where It Lives

| File | Role |
|---|---|
| `backend/src/ai.js` | Defines agents, Zod contracts, orchestration, fallbacks, embeddings, and logs. |
| `backend/src/server.js` | Exposes workflow endpoints and stores the current demo state. |
| `backend/src/seed.js` | Provides demo candidates, jobs, interviews, and fallback data. |
| `frontend/src/main.jsx` | Presents workflow results and the agent execution experience. |

## Configuration

Set these values in `backend/.env` to enable live models:

```env
OPENAI_API_KEY=your_api_key
OPENAI_FAST_MODEL=gpt-5-mini
OPENAI_REASONING_MODEL=gpt-5
OPENAI_EMBEDDING_MODEL=text-embedding-3-large
```

Without `OPENAI_API_KEY`, the same endpoints operate in deterministic demo mode.

## How to Demonstrate It

1. Start the project with `npm run dev`.
2. Enter a recruiter request, such as: `Hire a senior backend engineer with Node.js, Kafka, Redis, and distributed systems experience.`
3. Show the completed shortlist, questions, scheduling recommendation, briefing, and outreach.
4. Open the agent timeline to show which specialists ran, their models, and their outputs.
5. Submit interviewer feedback to show the Decision Agent's next-step recommendation.

## Future Improvements

- Add explicit quality checks between stages, such as validating a schedule against a calendar service.
- Run independent stages concurrently where their inputs do not depend on each other.
- Persist traces, agent outputs, and approvals in MongoDB for audit history.
- Add human approval gates before sending outreach or making an offer.
- Introduce tool-enabled agents for calendar availability, email delivery, and ATS synchronization.

## Summary

HireFlow AI demonstrates the multi-agent pattern through a centralized, observable hiring workflow: specialized agents handle narrow tasks, structured outputs connect the stages, and the orchestrator delivers a recruiter-ready result. The design makes the AI workflow understandable, reliable for a demo, and practical to evolve into a production hiring copilot.
