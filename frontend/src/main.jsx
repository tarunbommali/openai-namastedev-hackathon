import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion } from "framer-motion";
import ReactFlow, { Background, Controls, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import {
  Bot,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileJson,
  FileUp,
  Gauge,
  ListChecks,
  LogIn,
  MessageSquareText,
  Mic,
  NotebookPen,
  Sparkles,
  Upload
} from "lucide-react";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const defaultCommand = "Hire a senior backend engineer with Node.js, Kafka, Redis, and distributed systems experience.";

const defaultWorkflowResult = {
  completedActions: [
    "Screened 47 resumes",
    "Selected top 5 candidates",
    "Generated interview questions",
    "Proposed interview slots",
    "Prepared interviewer packet",
    "Drafted candidate outreach"
  ],
  semanticMatches: [
    {
      id: "cand-john",
      name: "John Doe",
      similarity: 0.92,
      strongOverlap: ["Node.js", "Kafka", "Redis", "event-driven architecture", "distributed systems"]
    },
    {
      id: "cand-aisha",
      name: "Aisha Mehta",
      similarity: 0.89,
      strongOverlap: ["backend APIs", "Docker", "AWS", "PostgreSQL"]
    },
    {
      id: "cand-priya",
      name: "Priya Nair",
      similarity: 0.84,
      strongOverlap: ["Node.js", "API integration", "product engineering"]
    }
  ],
  interviewerBrief: {
    candidate: "John Doe",
    strengths: ["Distributed systems", "Kafka", "AWS", "Node.js service reliability"],
    potentialConcerns: ["Kubernetes", "Security architecture"],
    recommendedFocusAreas: ["Event ordering", "Failure recovery", "Scalability tradeoffs"]
  },
  decision: {
    recommendation: "Proceed to technical round",
    confidence: 91,
    reason: "John Doe has strong overlap with Node.js, Kafka, Redis, and distributed systems requirements."
  },
  outreachDraft: {
    subject: "Technical interview invitation for Senior Backend Engineer role",
    body: "Hi John Doe, Rahul Sharma would like to meet you for Technical Round 1 on Wednesday 2:30 PM."
  }
};

const roiRows = [
  { task: "Resume Screening", traditional: "4 hours", hireflow: "12 minutes" },
  { task: "Interview Prep", traditional: "45 minutes", hireflow: "2 minutes" },
  { task: "Scheduling", traditional: "3 days", hireflow: "4 minutes" },
  { task: "Hiring Decision", traditional: "30 minutes", hireflow: "20 seconds" }
];

const initialParsedResume = {
  name: "John Doe",
  skills: ["Node.js", "Express", "Docker", "Kafka", "Redis", "AWS", "PostgreSQL"],
  experienceYears: 6,
  seniority: "Senior",
  domain: "Backend Engineering",
  education: "B.Tech Computer Science",
  achievements: ["Reduced API latency by 38%", "Scaled event pipeline to 2M messages/day"],
  roleSignals: ["distributed systems", "backend engineering", "production Docker deployments", "event-driven architecture"],
  relevantProjects: ["Kafka order pipeline", "Redis-backed API gateway", "AWS service migration"]
};

const seededJob = {
  title: "Senior Backend Engineer",
  location: "Bengaluru / Remote",
  team: "Platform Engineering",
  requirements: [
    "Node.js and Express APIs",
    "Distributed systems fundamentals",
    "Docker deployments",
    "Kafka event-driven architecture",
    "AWS production services"
  ]
};

const seededCandidates = [
  {
    id: "cand-john",
    name: "John Doe",
    email: "john.doe@example.com",
    matchScore: 92,
    confidence: 95,
    status: "Parsed and ranked",
    parsedResume: initialParsedResume,
    strengths: ["Distributed systems experience", "Docker expertise", "Node.js backend development", "Kafka event pipelines"],
    explanation:
      "Strong backend engineering experience, distributed systems background, production Docker deployments, and direct Kafka experience. Limited Kubernetes exposure is the main gap.",
    gaps: ["Kubernetes"]
  },
  {
    id: "cand-aisha",
    name: "Aisha Mehta",
    email: "aisha.mehta@example.com",
    matchScore: 84,
    confidence: 87,
    status: "Ranked",
    parsedResume: {
      name: "Aisha Mehta",
      skills: ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"],
      experienceYears: 5,
      roleSignals: ["backend engineering", "cloud services", "data APIs"],
      relevantProjects: ["analytics API migration", "cloud deployment platform"]
    },
    strengths: ["Backend API design", "Docker deployment", "AWS services"],
    explanation:
      "Excellent backend and deployment background with strong API fundamentals. Slightly less direct Node.js and Kafka experience than John.",
    gaps: ["Node.js production depth", "Kafka"]
  },
  {
    id: "cand-priya",
    name: "Priya Nair",
    email: "priya.nair@example.com",
    matchScore: 78,
    confidence: 81,
    status: "Ranked",
    parsedResume: {
      name: "Priya Nair",
      skills: ["React", "Node.js", "GraphQL", "MongoDB"],
      experienceYears: 3,
      roleSignals: ["full-stack development", "frontend-heavy product work"],
      relevantProjects: ["candidate portal", "GraphQL profile service"]
    },
    strengths: ["Node.js familiarity", "product engineering", "API integration"],
    explanation: "Good Node.js overlap, but experience is more full-stack than senior distributed backend systems.",
    gaps: ["distributed systems", "Docker", "Kafka", "AWS depth"]
  }
];
const pages = [
  { id: "login", label: "Landing / Login", role: "Candidate", icon: LogIn },
  { id: "jobs", label: "Open Role", role: "Candidate", icon: BriefcaseBusiness },
  { id: "upload", label: "Run Screening", role: "Candidate", icon: FileUp },
  { id: "status", label: "Applications", role: "Candidate", icon: CheckCircle2 },
  { id: "dashboard", label: "Agent Command Center", role: "Recruiter", icon: Gauge },
  { id: "applicants", label: "Ranked Shortlist", role: "Recruiter", icon: ListChecks },
  { id: "detail", label: "Fit Explanation", role: "Recruiter", icon: FileJson },
  { id: "questions", label: "Interview Plan", role: "Recruiter", icon: NotebookPen },
  { id: "scheduler", label: "Schedule From Voice", role: "Recruiter", icon: Mic },
  { id: "assigned", label: "Assigned Interviews", role: "Interviewer", icon: CalendarCheck },
  { id: "feedback", label: "Feedback Submission", role: "Interviewer", icon: ClipboardCheck }
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

async function request(path, options) {
  const response = await fetch(`${API}${path}`, {
    headers: options?.body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    ...options
  });
  if (!response.ok) throw new Error(`Request failed: ${path}`);
  return response.json();
}

function JsonPanel({ title, data, accent = "teal" }) {
  return (
    <section className="panel">
      <div className="panel-title">
        <FileJson size={18} className={`text-${accent}`} />
        <span>{title}</span>
      </div>
      <pre className="json">{JSON.stringify(data, null, 2)}</pre>
    </section>
  );
}

function Stat({ label, value, icon: Icon, tone = "teal" }) {
  return (
    <div className="stat">
      <div className={`icon-badge ${tone}`}>
        <Icon size={18} />
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="muted">{label}</div>
      </div>
    </div>
  );
}

function MatchBadge({ score }) {
  return (
    <div className="match-badge" aria-label={`${score}% match`}>
      <span>{score}%</span>
      <small>match</small>
    </div>
  );
}

function formatTraceTime(value) {
  if (!value) return "--:--:--";
  return new Date(value).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function getAgentStage(agentName = "") {
  if (agentName.includes("Resume")) return 1;
  if (agentName.includes("Embedding") || agentName.includes("Match")) return 2;
  if (agentName.includes("Question")) return 3;
  if (agentName.includes("Scheduler")) return 4;
  if (agentName.includes("Feedback") || agentName.includes("Decision")) return 5;
  if (agentName.includes("Offer") || agentName.includes("Briefing")) return 6;
  return 0;
}

function buildLiveExecution({ agentExecutionLog, isLoading }) {
  if (isLoading) {
    return [
      { id: "live-1", agent: "Resume Agent", status: "completed", outputSummary: "Parsed resume signals and seniority evidence", model: "gpt-5-mini", durationMs: 820 },
      { id: "live-2", agent: "Match Agent", status: "completed", outputSummary: "Ranked candidates with strengths and gaps", model: "gpt-5", durationMs: 1260 },
      { id: "live-3", agent: "Question Agent", status: "running", outputSummary: "Generating calibrated interview plan", model: "gpt-5", durationMs: 0 },
      { id: "live-4", agent: "Scheduler Agent", status: "queued", outputSummary: "Waiting to inspect availability and recommend slots", model: "gpt-5-mini", durationMs: 0 },
      { id: "live-5", agent: "Decision Agent", status: "queued", outputSummary: "Waiting for final shortlist recommendation", model: "gpt-5", durationMs: 0 }
    ];
  }

  return agentExecutionLog;
}

function WorkflowGraph({ agentExecutionLog, isLoading }) {
  const completedAgents = new Set(agentExecutionLog.map((trace) => trace.agent));
  const activeStage = isLoading
    ? 3
    : Math.max(0, ...agentExecutionLog.map((trace) => getAgentStage(trace.agent)));
  const nodeNames = [
    "Recruiter Intent",
    "Resume Agent",
    "Match Agent",
    "Question Agent",
    "Scheduler Agent",
    "Feedback Agent",
    "Decision Agent",
    "Offer Agent"
  ];

  const nodes = nodeNames.map((name, index) => ({
    id: name,
    position: { x: index * 190, y: index % 2 ? 88 : 12 },
    data: { label: name },
    className: cn(
      "workflow-node",
      (index === 0 || completedAgents.has(name) || index < activeStage) && "active",
      index === activeStage && "running"
    )
  }));

  const edges = nodeNames.slice(0, -1).map((name, index) => ({
    id: `${name}-${nodeNames[index + 1]}`,
    source: name,
    target: nodeNames[index + 1],
    animated: index < Math.max(1, activeStage),
    markerEnd: { type: MarkerType.ArrowClosed },
    className: "workflow-edge"
  }));

  return (
    <div className="workflow-graph">
      <ReactFlow nodes={nodes} edges={edges} fitView nodesDraggable={false} nodesConnectable={false} zoomOnScroll={false}>
        <Background gap={18} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

function LoginPage({ setPage }) {
  const proofPoints = [
    { label: "Recruiter workload", value: "80% less", detail: "Screening, questions, scheduling, feedback" },
    { label: "Manual handoffs", value: "5 -> 1", detail: "One recruiter intent becomes an execution trail" },
    { label: "Time to interview", value: "Days -> minutes", detail: "Slots recommended and interview created" }
  ];

  return (
    <div className="content-grid">
      <motion.section className="feature-band" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div>
          <p className="eyebrow">HireFlow AI</p>
          <h1>Ask once. Watch recruiting agents execute.</h1>
          <p className="lede">
            HireFlow turns a recruiter intent into screening, ranking, interview questions, scheduling, feedback, and a hiring recommendation.
          </p>
          <div className="command-preview">
            "Find the best backend candidate, create the interview plan, and schedule Rahul's technical round."
          </div>
        </div>
        <button className="primary-btn" onClick={() => setPage("jobs")}>
          <Sparkles size={18} />
          Ask HireFlow
        </button>
      </motion.section>
      <div className="impact-grid">
        {proofPoints.map((point) => (
          <section className="impact-card" key={point.label}>
            <span>{point.label}</span>
            <strong>{point.value}</strong>
            <p>{point.detail}</p>
          </section>
        ))}
      </div>
      <section className="panel compact">
        <div className="panel-title">
          <Bot size={18} />
          <span>Demo personas</span>
        </div>
        <div className="persona-row">
          <strong>Candidate</strong>
          <span>John Doe</span>
        </div>
        <div className="persona-row">
          <strong>Recruiter</strong>
          <span>Hiring team</span>
        </div>
        <div className="persona-row">
          <strong>Interviewer</strong>
          <span>Rahul Sharma</span>
        </div>
      </section>
    </div>
  );
}

function JobListing({ job, setPage }) {
  return (
    <div className="content-grid">
      <motion.section className="feature-band" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div>
          <p className="eyebrow">Open role</p>
          <h1>{job.title}</h1>
          <p className="lede">{job.team} - {job.location}</p>
        </div>
        <button className="primary-btn" onClick={() => setPage("upload")}>
          <Upload size={18} />
          Apply with resume
        </button>
      </motion.section>
      <section className="panel">
        <div className="panel-title">
          <BriefcaseBusiness size={18} />
          <span>Role signals HireFlow will match</span>
        </div>
        <div className="chips">
          {job.requirements.map((item) => (
            <span className="chip" key={item}>{item}</span>
          ))}
        </div>
      </section>
    </div>
  );
}

function ResumeUpload({ parsedResume, onUpload, isLoading }) {
  const sampleText =
    "John Doe, senior backend engineer with 6 years building Node.js APIs, Express services, Docker deployments, Kafka pipelines, Redis caching, AWS infrastructure, PostgreSQL models, and distributed systems.";

  return (
    <div className="two-column">
      <section className="panel">
        <div className="panel-title">
          <FileUp size={18} />
          <span>Run Screening</span>
        </div>
        <textarea className="textarea" defaultValue={sampleText} id="resumeText" />
        <button
          className="primary-btn full"
          onClick={() => onUpload(document.getElementById("resumeText").value)}
          disabled={isLoading}
        >
          <Sparkles size={18} />
          {isLoading ? "Parsing resume..." : "Upload and AI parse"}
        </button>
      </section>
      <JsonPanel title="Visible parsed resume JSON" data={parsedResume} />
    </div>
  );
}

function ApplicationStatus({ topCandidate }) {
  return (
    <div className="content-grid">
      <motion.section className="feature-band" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div>
          <p className="eyebrow">Candidate status</p>
          <h1>John Doe is parsed, ranked, and ready for recruiter review</h1>
          <p className="lede">HireFlow has already extracted the resume and compared it against the backend role.</p>
        </div>
        <MatchBadge score={topCandidate.matchScore} />
      </motion.section>
      <section className="panel">
        <div className="timeline">
          {["Resume uploaded", "AI resume parsed", "Semantic match scored", "Recruiter review queued"].map((item) => (
            <div className="timeline-item" key={item}>
              <CheckCircle2 size={18} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel-title">
          <Bot size={18} />
          <span>Candidate Copilot</span>
        </div>
        <div className="brief-grid">
          <div>
            <strong>Interview prep</strong>
            <span className="chip">Review Kafka retries</span>
            <span className="chip">Practice Redis rate limits</span>
          </div>
          <div>
            <strong>Timeline prediction</strong>
            <span className="chip">Technical round likely this week</span>
            <span className="chip">Decision in 3-5 days</span>
          </div>
          <div>
            <strong>Learning recommendations</strong>
            <span className="chip warning">Kubernetes basics</span>
            <span className="chip warning">Security architecture</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function RecruiterDashboard({
  candidates,
  feedbackRecord,
  setPage,
  agentModelPlan,
  agentExecutionLog,
  commandIntent,
  setCommandIntent,
  workflowResult,
  onRunCommand,
  isLoading
}) {
  const visibleExecution = buildLiveExecution({ agentExecutionLog, isLoading });
  const commandPresets = [
    "Hire a senior backend engineer with Kafka and distributed systems experience.",
    "Find backend engineers, generate interview plans, and schedule Rahul next week.",
    "Prepare interviewer packets and draft outreach for the top candidate."
  ];
  const agentSteps = [
    { name: "Resume Agent", work: "Extracts skills, seniority, projects, achievements, and role signals", state: isLoading ? "completed" : "ready" },
    { name: "Match Agent", work: "Ranks candidates semantically and explains strengths and gaps", state: isLoading ? "completed" : "ready" },
    { name: "Question Agent", work: "Generates Easy, Medium, and Hard interview questions", state: isLoading ? "running" : "ready" },
    { name: "Scheduler Agent", work: "Finds slots and creates the interview plan", state: isLoading ? "queued" : "ready" },
    { name: "Decision Agent", work: "Recommends shortlist and next hiring step", state: isLoading ? "queued" : "ready" },
    { name: "Offer Agent", work: "Drafts candidate communication for recruiter approval", state: isLoading ? "queued" : "ready" }
  ];

  return (
    <div className="content-grid">
      <section className="panel command-center">
        <div>
          <p className="eyebrow">Recruiter Command Interface</p>
          <h2>Delegate hiring work to AI agents.</h2>
          <p className="lede">Intent becomes orchestration, and orchestration becomes completed hiring actions.</p>
          <textarea className="command-input" value={commandIntent} onChange={(event) => setCommandIntent(event.target.value)} />
          <div className="command-presets">
            {commandPresets.map((command) => (
              <button type="button" key={command} onClick={() => setCommandIntent(command)}>
                {command}
              </button>
            ))}
          </div>
        </div>
        <button className="primary-btn" onClick={onRunCommand} disabled={isLoading}>
          <Sparkles size={18} />
          {isLoading ? "Agents executing..." : "Execute command"}
        </button>
      </section>
      <section className="panel magic-moment">
        <div className="panel-title">
          <Sparkles size={18} />
          <span>Autonomous work stream</span>
        </div>
        <div className="completed-grid live-stream">
          {(workflowResult?.completedActions || defaultWorkflowResult.completedActions).map((action) => (
            <div className="completed-action" key={action}>
              <CheckCircle2 size={17} />
              <span>{action}</span>
            </div>
          ))}
        </div>
      </section>
      <div className="stats-grid">
        <Stat label="Top semantic match" value={`${candidates[0]?.matchScore || 92}%`} icon={Sparkles} tone="teal" />
        <Stat label="Recruiter workload saved" value="80%" icon={Gauge} tone="coral" />
        <Stat
          label="Decision confidence"
          value={feedbackRecord?.recommendation?.confidence ? `${feedbackRecord.recommendation.confidence}%` : "Pending"}
          icon={ClipboardCheck}
          tone="plum"
        />
      </div>
      <section className="panel">
        <div className="panel-title">
          <Bot size={18} />
          <span>Agent workflow DAG</span>
        </div>
        <WorkflowGraph agentExecutionLog={visibleExecution} isLoading={isLoading} />
      </section>
      <section className="panel">
        <div className="panel-title">
          <Bot size={18} />
          <span>Visible multi-agent execution trail</span>
        </div>
        <div className="agent-flow">
          {agentSteps.map((step, index) => (
            <div className={cn("agent-step", step.state)} key={step.name}>
              <div className="agent-node">
                <strong>{step.name}</strong>
                <span>{step.work}</span>
              </div>
              <small>{step.state}</small>
              {index < agentSteps.length - 1 && <ChevronRight size={18} />}
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel-title">
          <Sparkles size={18} />
          <span>Embeddings-based candidate intelligence</span>
        </div>
        <div className="similarity-list">
          {(workflowResult?.semanticMatches || defaultWorkflowResult.semanticMatches).map((match) => (
            <div className="similarity-row" key={match.id}>
              <div>
                <strong>{match.name}</strong>
                <span>{match.strongOverlap.join(" · ")}</span>
              </div>
              <b>{match.similarity.toFixed(2)}</b>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel-title">
          <NotebookPen size={18} />
          <span>Interviewer briefing packet</span>
        </div>
        <div className="brief-grid">
          <div>
            <strong>Candidate strengths</strong>
            {(workflowResult?.interviewerBrief || defaultWorkflowResult.interviewerBrief).strengths.map((item) => <span className="chip" key={item}>{item}</span>)}
          </div>
          <div>
            <strong>Potential concerns</strong>
            {(workflowResult?.interviewerBrief || defaultWorkflowResult.interviewerBrief).potentialConcerns.map((item) => <span className="chip warning" key={item}>{item}</span>)}
          </div>
          <div>
            <strong>Focus areas</strong>
            {(workflowResult?.interviewerBrief || defaultWorkflowResult.interviewerBrief).recommendedFocusAreas.map((item) => <span className="chip" key={item}>{item}</span>)}
          </div>
        </div>
      </section>
      <section className="panel">
        <div className="panel-title">
          <ListChecks size={18} />
          <span>Real agent execution timeline</span>
        </div>
        <div className="trace-list">
          {visibleExecution.length ? (
            visibleExecution.slice(0, 8).map((trace, index) => (
              <div className={cn("trace-row", trace.status === "running" && "running")} key={trace.id || `${trace.agent}-${index}`}>
                <time>{formatTraceTime(trace.startedAt)}</time>
                <div>
                  <strong>{trace.agent}</strong>
                  <span>{trace.outputSummary}</span>
                </div>
                <small>{trace.model} · {trace.status} · {trace.durationMs}ms</small>
              </div>
            ))
          ) : (
            <div className="trace-empty">Run screening, generate an interview plan, or schedule an interview to create live agent traces.</div>
          )}
        </div>
      </section>
      <section className="panel">
        <div className="panel-title">
          <Gauge size={18} />
          <span>Business impact dashboard</span>
        </div>
        <div className="roi-table">
          {roiRows.map((row) => (
            <div className="roi-row" key={row.task}>
              <strong>{row.task}</strong>
              <span>Traditional: {row.traditional}</span>
              <b>HireFlow: {row.hireflow}</b>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel-title">
          <MessageSquareText size={18} />
          <span>Drafted candidate communication</span>
        </div>
        <div className="draft-box">
          <strong>{(workflowResult?.outreachDraft || defaultWorkflowResult.outreachDraft).subject}</strong>
          <p>{(workflowResult?.outreachDraft || defaultWorkflowResult.outreachDraft).body}</p>
        </div>
      </section>
      <section className="panel">
        <div className="panel-title">
          <Sparkles size={18} />
          <span>OpenAI Agents SDK model plan</span>
        </div>
        <div className="chips">
          {Object.entries(agentModelPlan).map(([agent, model]) => (
            <span className="chip" key={agent}>{agent}: {model}</span>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel-title">
          <Bot size={18} />
          <span>Copilot next actions</span>
        </div>
        <button className="action-row" onClick={() => setPage("applicants")}>
          Review ranked shortlist <ChevronRight size={18} />
        </button>
        <button className="action-row" onClick={() => setPage("questions")}>
          Generate interview plan <ChevronRight size={18} />
        </button>
        <button className="action-row" onClick={() => setPage("scheduler")}>
          Schedule from voice <ChevronRight size={18} />
        </button>
      </section>
    </div>
  );
}

function ApplicantsList({ candidates, setSelectedCandidateId, setPage }) {
  return (
    <section className="panel">
      <div className="panel-title">
        <ListChecks size={18} />
        <span>Ranked shortlist</span>
      </div>
      <div className="candidate-list">
        {candidates.map((candidate) => (
          <button
            className="candidate-row"
            key={candidate.id}
            onClick={() => {
              setSelectedCandidateId(candidate.id);
              setPage("detail");
            }}
          >
            <div>
              <strong>{candidate.name}</strong>
              <span>{candidate.email}</span>
            </div>
            <MatchBadge score={candidate.matchScore} />
          </button>
        ))}
      </div>
    </section>
  );
}

function CandidateDetail({ candidate }) {
  return (
    <div className="two-column">
      <section className="panel">
        <div className="detail-header">
          <div>
            <p className="eyebrow">Explainable match</p>
            <h2>{candidate.name}</h2>
          </div>
          <MatchBadge score={candidate.matchScore} />
        </div>
        <div className="explanation">
          <Sparkles size={20} />
          <p>{candidate.explanation}</p>
        </div>
        <div className="chips strengths">
          {(candidate.strengths || []).map((strength) => (
            <span className="chip" key={strength}>Strength: {strength}</span>
          ))}
        </div>
        <div className="chips">
          {candidate.gaps.map((gap) => (
            <span className="chip warning" key={gap}>Missing: {gap}</span>
          ))}
        </div>
      </section>
      <JsonPanel title="Candidate resume signals" data={candidate.parsedResume} />
    </div>
  );
}

function InterviewQuestionGenerator({ candidate, questionSet, onGenerate, isLoading }) {
  const visibleQuestionSet = questionSet || {
    candidate: candidate.name,
    role: seededJob.title,
    questions: [
      {
        difficulty: "Easy",
        question: "How do you structure a production Node.js service for reliability and observability?",
        signal: "Node.js backend fundamentals"
      },
      {
        difficulty: "Medium",
        question: "How would you design an idempotent Kafka consumer that safely handles retries?",
        signal: "Kafka and distributed systems"
      },
      {
        difficulty: "Hard",
        question: "Design a Redis-backed rate limiter for a high-traffic API. What failure modes would you plan for?",
        signal: "Redis, scaling, and system design"
      }
    ]
  };

  return (
    <div className="two-column">
      <section className="panel">
        <div className="panel-title">
          <NotebookPen size={18} />
          <span>AI Interview Plan</span>
        </div>
        <p className="muted">
          Uses {candidate.name}'s resume signals and the Senior Backend Engineer JD to create calibrated interview questions.
        </p>
        <div className="question-list">
          {visibleQuestionSet.questions.map((item) => (
            <div className="question-card" key={`${item.difficulty}-${item.question}`}>
              <small>{item.difficulty}</small>
              <strong>{item.question}</strong>
              <span>Signal: {item.signal}</span>
            </div>
          ))}
        </div>
        <button className="primary-btn full" onClick={onGenerate} disabled={isLoading}>
          <Sparkles size={18} />
          {isLoading ? "Generating questions..." : "Generate from resume + JD"}
        </button>
      </section>
      <JsonPanel title="Question generator JSON" data={visibleQuestionSet} />
    </div>
  );
}

function VoiceScheduler({ scheduleCommand, setScheduleCommand, scheduleResult, onSchedule, isLoading }) {
  const [draftEntities, setDraftEntities] = useState(null);
  const visibleEntities = scheduleResult?.extractedEntities || draftEntities || {
    candidate: "John Doe",
    interviewer: "Rahul Sharma",
    round: "Technical Round 1",
    durationMinutes: 45,
    foundSlots: ["Tuesday 11:00 AM", "Wednesday 2:30 PM", "Thursday 10:00 AM"],
    candidatePreference: "Candidate prefers afternoons",
    recommendedSlot: "Wednesday 2:30 PM",
    scheduledAt: "2026-07-17T14:00:00+05:30",
    time: "Wednesday, 2:30 PM"
  };

  function extractEntities() {
    setDraftEntities({
      candidate: "John Doe",
      interviewer: "Rahul Sharma",
      round: "Technical Round 1",
      durationMinutes: 45,
      foundSlots: ["Tuesday 11:00 AM", "Wednesday 2:30 PM", "Thursday 10:00 AM"],
      candidatePreference: "Candidate prefers afternoons",
      recommendedSlot: "Wednesday 2:30 PM",
      scheduledAt: "2026-07-17T14:00:00+05:30",
      time: "Wednesday, 2:30 PM"
    });
  }

  async function confirmSchedule() {
    await onSchedule();
    setDraftEntities(null);
  }

  return (
    <div className="two-column">
      <section className="panel">
        <div className="panel-title">
          <Mic size={18} />
          <span>Schedule From Voice</span>
        </div>
        <textarea className="textarea large" value={scheduleCommand} onChange={(event) => setScheduleCommand(event.target.value)} />
        <button className="primary-btn full" onClick={extractEntities} disabled={isLoading}>
          <MessageSquareText size={18} />
          Run Scheduling Agent
        </button>
        <div className="slot-list">
          {(visibleEntities.foundSlots || []).map((slot) => (
            <span className={slot === visibleEntities.recommendedSlot ? "slot recommended" : "slot"} key={slot}>
              {slot}
            </span>
          ))}
        </div>
        <div className="success">
          Recommended: {visibleEntities.recommendedSlot || visibleEntities.time} · {visibleEntities.candidatePreference}
        </div>
        {draftEntities && !scheduleResult?.message && (
          <div className="confirm-box">
            <strong>Confirm interview scheduling?</strong>
            <button className="primary-btn" onClick={confirmSchedule} disabled={isLoading}>
              <CalendarCheck size={18} />
              {isLoading ? "Scheduling..." : "Confirm interview"}
            </button>
          </div>
        )}
        {scheduleResult?.message && (
          <div className="execution-receipt">
            <strong>Agent execution complete</strong>
            <span>{"Entities extracted -> best slot selected -> interview created -> timeline updated"}</span>
          </div>
        )}
      </section>
      <JsonPanel title="Extracted scheduling entities" data={visibleEntities} />
    </div>
  );
}

function AssignedInterviews({ interviews, setPage }) {
  return (
    <section className="panel">
      <div className="panel-title">
        <CalendarCheck size={18} />
        <span>Rahul Sharma's assigned interviews</span>
      </div>
      <div className="candidate-list">
        {interviews.map((interview) => (
          <div className="candidate-row static" key={interview.id}>
            <div>
              <strong>{interview.candidate}</strong>
              <span>{interview.round} with {interview.interviewer} - {interview.time}</span>
            </div>
            <span className="status-pill">{interview.status}</span>
          </div>
        ))}
      </div>
      <button className="primary-btn" onClick={() => setPage("feedback")}>
        <ClipboardCheck size={18} />
        Submit feedback
      </button>
    </section>
  );
}

function FeedbackSubmission({ feedbackText, setFeedbackText, feedbackRecord, onFeedback, isLoading }) {
  return (
    <div className="two-column">
      <section className="panel">
        <div className="panel-title">
          <ClipboardCheck size={18} />
          <span>Feedback Submission</span>
        </div>
        <textarea className="textarea large" value={feedbackText} onChange={(event) => setFeedbackText(event.target.value)} />
        <button className="primary-btn full" onClick={onFeedback} disabled={isLoading}>
          <Sparkles size={18} />
          {isLoading ? "Generating recommendation..." : "Submit feedback and recommend next step"}
        </button>
      </section>
      <section className="panel">
        <div className="panel-title">
          <Bot size={18} />
          <span>Final AI recommendation</span>
        </div>
        <div className="signal-grid">
          <div><strong>Technical Skills</strong><span>8/10</span></div>
          <div><strong>Communication</strong><span>9/10</span></div>
          <div><strong>System Design</strong><span>5/10</span></div>
        </div>
        <div className="recommendation">
          <strong>{feedbackRecord?.recommendation?.recommendation || "Proceed with offer"}</strong>
          <p>{feedbackRecord?.recommendation?.reason || "Strong backend fundamentals, excellent system design understanding, clear communication, and relevant distributed systems experience."}</p>
          <span>{feedbackRecord?.recommendation?.confidence || 91}% confidence</span>
        </div>
        <JsonPanel title="Recommendation JSON" data={feedbackRecord?.recommendation || {
          recommendation: "Proceed with offer",
          reason: "Strong backend fundamentals, excellent system design understanding, clear communication, and relevant distributed systems experience.",
          confidence: 91
        }} />
      </section>
    </div>
  );
}

function App() {
  const [page, setPage] = useState("login");
  const [job, setJob] = useState(seededJob);
  const [candidates, setCandidates] = useState(seededCandidates);
  const [selectedCandidateId, setSelectedCandidateId] = useState("cand-john");
  const [parsedResume, setParsedResume] = useState(initialParsedResume);
  const [interviews, setInterviews] = useState([
    {
      id: "iv-001",
      candidate: "John Doe",
      interviewer: "Rahul Sharma",
      round: "Technical Round 1",
      time: "Tomorrow, 2:00 PM",
      status: "Created"
    }
  ]);
  const [scheduleCommand, setScheduleCommand] = useState("Schedule John with Rahul tomorrow at 2 PM for technical round one.");
  const [scheduleResult, setScheduleResult] = useState(null);
  const [feedbackText, setFeedbackText] = useState(
    "Strong backend fundamentals, excellent system design understanding, strong communication, and relevant distributed systems experience."
  );
  const [feedbackRecord, setFeedbackRecord] = useState(null);
  const [questionSet, setQuestionSet] = useState(null);
  const [commandIntent, setCommandIntent] = useState(defaultCommand);
  const [workflowResult, setWorkflowResult] = useState(defaultWorkflowResult);
  const [agentModelPlan, setAgentModelPlan] = useState({
    resumeAgent: "gpt-5-mini",
    matchAgent: "gpt-5",
    questionAgent: "gpt-5",
    schedulerAgent: "gpt-5-mini",
    decisionAgent: "gpt-5"
  });
  const [agentExecutionLog, setAgentExecutionLog] = useState([]);
  const [loading, setLoading] = useState("");

  useEffect(() => {
    request("/api/demo")
      .then((data) => {
        setJob(data.job || seededJob);
        setCandidates(data.candidates || seededCandidates);
        setParsedResume(data.parsedResume || initialParsedResume);
        setInterviews(data.interviews?.length ? data.interviews : interviews);
        setAgentModelPlan(data.agentModelPlan || agentModelPlan);
        setAgentExecutionLog(data.agentExecutionLog || []);
      })
      .catch(() => {});
  }, []);

  const selectedCandidate = useMemo(
    () => candidates.find((candidate) => candidate.id === selectedCandidateId) || candidates[0],
    [candidates, selectedCandidateId]
  );

  async function uploadResume(resumeText) {
    setLoading("upload");
    try {
      const data = await request("/api/resumes", {
        method: "POST",
        body: JSON.stringify({ resumeText })
      });
      setParsedResume(data.parsedResume);
      setCandidates(data.rankings);
      setAgentExecutionLog(data.agentExecutionLog || []);
      setSelectedCandidateId(data.rankings[0]?.id || "cand-john");
      setPage("applicants");
    } finally {
      setLoading("");
    }
  }

  async function runAutonomousCommand() {
    setLoading("command");
    try {
      const data = await request("/api/command", {
        method: "POST",
        body: JSON.stringify({ intent: commandIntent })
      });
      setWorkflowResult(data);
      setAgentExecutionLog(data.agentExecutionLog || []);
      if (data.rankings?.length) {
        setCandidates((current) =>
          current
            .map((candidate) => {
              const ranking = data.rankings.find((item) => item.id === candidate.id || item.name === candidate.name);
              return ranking ? { ...candidate, ...ranking } : candidate;
            })
            .sort((a, b) => b.matchScore - a.matchScore)
        );
      }
    } finally {
      setLoading("");
    }
  }

  async function scheduleInterview() {
    setLoading("schedule");
    try {
      const data = await request("/api/interviews/schedule", {
        method: "POST",
        body: JSON.stringify({ command: scheduleCommand })
      });
      setScheduleResult(data);
      setAgentExecutionLog(data.agentExecutionLog || []);
      setInterviews((current) => [data.interview, ...current]);
    } finally {
      setLoading("");
    }
  }

  async function generateQuestions() {
    setLoading("questions");
    try {
      const data = await request("/api/questions", {
        method: "POST",
        body: JSON.stringify({ candidateId: selectedCandidate.id })
      });
      setQuestionSet(data);
      setAgentExecutionLog(data.agentExecutionLog || []);
    } finally {
      setLoading("");
    }
  }

  async function submitFeedback() {
    setLoading("feedback");
    try {
      const data = await request("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ feedbackText })
      });
      setFeedbackRecord(data);
      setAgentExecutionLog(data.agentExecutionLog || []);
    } finally {
      setLoading("");
    }
  }

  const pageTitle = pages.find((item) => item.id === page)?.label || "HireFlow AI";

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Bot size={24} /></div>
          <div>
            <strong>HireFlow AI</strong>
            <span>Autonomous recruiting copilot</span>
          </div>
        </div>
        <nav>
          {["Candidate", "Recruiter", "Interviewer"].map((role) => (
            <div className="nav-group" key={role}>
              <p>{role}</p>
              {pages
                .filter((item) => item.role === role)
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <button className={cn("nav-item", page === item.id && "active")} key={item.id} onClick={() => setPage(item.id)}>
                      <Icon size={17} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
            </div>
          ))}
        </nav>
      </aside>
      <section className="main-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">4-day hackathon prototype</p>
            <h1>{pageTitle}</h1>
          </div>
          <div className="demo-pill">
            <Sparkles size={16} />
            AI outputs visible
          </div>
        </header>
        {page === "login" && <LoginPage setPage={setPage} />}
        {page === "jobs" && <JobListing job={job} setPage={setPage} />}
        {page === "upload" && <ResumeUpload parsedResume={parsedResume} onUpload={uploadResume} isLoading={loading === "upload"} />}
        {page === "status" && <ApplicationStatus topCandidate={candidates[0]} />}
        {page === "dashboard" && (
          <RecruiterDashboard
            candidates={candidates}
            feedbackRecord={feedbackRecord}
            setPage={setPage}
            agentModelPlan={agentModelPlan}
            agentExecutionLog={agentExecutionLog}
            commandIntent={commandIntent}
            setCommandIntent={setCommandIntent}
            workflowResult={workflowResult}
            onRunCommand={runAutonomousCommand}
            isLoading={loading === "command"}
          />
        )}
        {page === "applicants" && (
          <ApplicantsList candidates={candidates} setSelectedCandidateId={setSelectedCandidateId} setPage={setPage} />
        )}
        {page === "detail" && <CandidateDetail candidate={selectedCandidate} />}
        {page === "questions" && (
          <InterviewQuestionGenerator
            candidate={selectedCandidate}
            questionSet={questionSet}
            onGenerate={generateQuestions}
            isLoading={loading === "questions"}
          />
        )}
        {page === "scheduler" && (
          <VoiceScheduler
            scheduleCommand={scheduleCommand}
            setScheduleCommand={setScheduleCommand}
            scheduleResult={scheduleResult}
            onSchedule={scheduleInterview}
            isLoading={loading === "schedule"}
          />
        )}
        {page === "assigned" && <AssignedInterviews interviews={interviews} setPage={setPage} />}
        {page === "feedback" && (
          <FeedbackSubmission
            feedbackText={feedbackText}
            setFeedbackText={setFeedbackText}
            feedbackRecord={feedbackRecord}
            onFeedback={submitFeedback}
            isLoading={loading === "feedback"}
          />
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);












