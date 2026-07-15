# HireFlow AI - 3-Minute Demo Script

**Target runtime:** 2:45-3:00  
**Format:** screen recording with voiceover

---

## 0:00-0:15 - Hook

**Screen:** HireFlow AI landing screen with command preview and impact metrics.

**Voiceover:**  
"Recruiters do not need another ATS. They need an agent that can take one hiring intent and execute the workflow. Ask HireFlow once, and it screens, ranks, generates the interview plan, schedules the round, and recommends the next step."

**Show on screen:**
- Recruiter workload: 80% less.
- Manual handoffs: 5 -> 1.
- Time to interview: Days -> minutes.

---

## 0:15-0:45 - Resume Parsing

**Screen:** Candidate runs screening. Parsed fields appear visibly on screen.

**Voiceover:**  
"A candidate uploads a resume. Instead of keyword matching, the Resume Agent extracts skills, experience, seniority, achievements, projects, and role signals."

**Show on screen:**
```json
{
  "name": "John Doe",
  "skills": ["Node.js", "Express", "Docker", "Kafka", "Redis", "AWS", "PostgreSQL"],
  "experienceYears": 6,
  "seniority": "Senior",
  "domain": "Backend Engineering",
  "achievements": ["Reduced API latency by 38%", "Scaled event pipeline to 2M messages/day"],
  "roleSignals": ["distributed systems", "backend engineering", "production Docker deployments", "event-driven architecture"],
  "relevantProjects": ["Kafka order pipeline", "Redis-backed API gateway", "AWS service migration"]
}
```

---

## 0:45-1:15 - Agent Command Center

**Screen:** Recruiter opens the Agent Command Center.

**Voiceover:**  
"This is the important part: judges can see the orchestration. Resume Agent, Match Agent, Question Agent, Scheduler Agent, Feedback Agent, and Decision Agent each show what they did or what they are ready to do."

**Show on screen:**
- Visible multi-agent execution trail.
- Real agent execution timeline logs.
- Agent workflow DAG.
- Embeddings-based candidate similarity.
- OpenAI Agents SDK model plan.
- Top semantic match: 92%.
- Recruiter workload saved: 80%.

---

## 1:15-1:45 - Ranked Shortlist

**Screen:** Recruiter opens ranked shortlist. Candidate cards show match percentages. Click John.

**Voiceover:**  
"The recruiter opens a shortlist ranked by actual fit, not keyword count. Clicking a candidate shows why John scored 92 percent."

**Show on screen:**
- Completed-work moment: screened resumes, top candidates, generated questions, proposed slots, interviewer packet, drafted outreach.
- John Doe - 92%.
- Aisha Mehta - 84%.
- Priya Nair - 78%.

**Explanation panel:**  
"Strong backend engineering experience, distributed systems background, production Docker deployments, and direct Kafka experience. Limited Kubernetes exposure is the main gap."

---

## 1:45-2:15 - Interview Plan

**Screen:** Recruiter clicks Generate interview plan.

**Voiceover:**  
"The Question Agent converts John's resume and the job description into calibrated Easy, Medium, and Hard interview questions, each tied to the hiring signal being tested."

**Show on screen:**
- Easy: Node.js reliability and observability question.
- Medium: Kafka retry/idempotency question.
- Hard: Redis-backed rate limiter design question.
- Interviewer brief: strengths, concerns, and recommended focus areas.

---

## 2:15-2:40 - Natural Language Scheduling

**Screen:** Recruiter opens Schedule From Voice.

**Voiceover:**  
"Now the recruiter just says what they want."

**Typed or spoken command:**  
"Schedule John with Rahul tomorrow at 2 PM for Technical Round 1."

**Voiceover:**  
"HireFlow extracts the candidate, interviewer, round, duration, slot options, candidate preference, and recommended time. Then it creates the interview automatically. This is the memorable agent moment."

**Show on screen:**
```json
{
  "candidate": "John Doe",
  "interviewer": "Rahul Sharma",
  "round": "Technical Round 1",
  "durationMinutes": 45,
  "foundSlots": ["Tuesday 11:00 AM", "Wednesday 2:30 PM", "Thursday 10:00 AM"],
  "candidatePreference": "Candidate prefers afternoons",
  "recommendedSlot": "Wednesday 2:30 PM"
}
```

Then show:
- Agent execution complete.
- Entities extracted -> best slot selected -> interview created -> timeline updated.
- Scheduler Agent log shows model, status, duration, and output summary.

---

## 2:40-2:55 - Feedback Loop

**Screen:** Interviewer submits feedback. Recruiter dashboard updates with AI-suggested next step.

**Voiceover:**  
"After the interview, the interviewer submits feedback directly in the platform, and the recruiter sees an AI-suggested next step."

**Show on screen:**
- Feedback: "Strong backend fundamentals, excellent system design understanding, strong communication, and relevant distributed systems experience."
- Structured signals: Technical Skills 8/10, Communication 9/10, System Design 5/10.
- AI suggestion: "Proceed with offer."
- Confidence: 91%.
- Reason: "Strong backend fundamentals, excellent system design understanding, clear communication, and relevant distributed systems experience."

---

## 2:55-3:00 - Close

**Screen:** Final HireFlow AI screen with tagline.

**Voiceover:**  
"This is not software recruiters fill out. It is an autonomous recruiting copilot that makes the AI work visible, trustworthy, and useful. HireFlow AI."

---

## Recording Notes

- Start with the AI-visible moments, especially resume parsing and scheduling.
- Do not open with login, navigation, or account setup.
- Keep every AI output visible on screen: parsed JSON, match score, explanation text, generated questions, extracted scheduling entities, model plan, real execution logs, DAG, semantic similarity, interviewer brief, and suggested next step.
- If using slides, keep them before or after the live demo. Do not let slides replace the working product flow.
- Pause briefly after each AI action so judges can read the output before you move on.
