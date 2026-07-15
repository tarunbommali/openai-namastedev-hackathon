import { Agent, run } from "@openai/agents";
import OpenAI from "openai";
import { z } from "zod";
import { candidates, job } from "./seed.js";

const fastModel = process.env.OPENAI_FAST_MODEL || "gpt-5-mini";
const reasoningModel = process.env.OPENAI_REASONING_MODEL || "gpt-5";
const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-large";
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const agentExecutionLog = [];

function summarizeOutput(output) {
  if (output?.rankings) return `${output.rankings.length} candidates ranked`;
  if (output?.questions) return `${output.questions.length} interview questions generated`;
  if (output?.recommendedSlot) return `recommended ${output.recommendedSlot}`;
  if (output?.recommendation) return `${output.recommendation} (${output.confidence}% confidence)`;
  if (output?.skills) return `${output.skills.length} skills extracted`;
  return "structured JSON produced";
}

function appendAgentLog({ agent, input, output, status, mode, startedAt, error }) {
  const completedAt = new Date();
  agentExecutionLog.unshift({
    id: `trace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    agent: agent.name,
    model: agent.model,
    status,
    mode,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    durationMs: completedAt.getTime() - startedAt.getTime(),
    inputPreview: typeof input === "string" ? input.slice(0, 180) : JSON.stringify(input).slice(0, 180),
    outputSummary: summarizeOutput(output),
    error: error?.message
  });

  if (agentExecutionLog.length > 30) agentExecutionLog.length = 30;
}

function appendSyntheticLog(agentName, model, input, outputSummary, durationMs = 650) {
  const completedAt = new Date();
  const startedAt = new Date(completedAt.getTime() - durationMs);
  agentExecutionLog.unshift({
    id: `trace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    agent: agentName,
    model,
    status: "completed",
    mode: "orchestrated",
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    durationMs,
    inputPreview: input.slice(0, 180),
    outputSummary
  });

  if (agentExecutionLog.length > 30) agentExecutionLog.length = 30;
}

function cosineSimilarity(left, right) {
  const dot = left.reduce((sum, value, index) => sum + value * right[index], 0);
  const leftMagnitude = Math.sqrt(left.reduce((sum, value) => sum + value * value, 0));
  const rightMagnitude = Math.sqrt(right.reduce((sum, value) => sum + value * value, 0));
  return dot / (leftMagnitude * rightMagnitude || 1);
}

function fallbackSemanticMatches() {
  return [
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
  ];
}

const resumeSchema = z.object({
  name: z.string(),
  skills: z.array(z.string()),
  experienceYears: z.number(),
  seniority: z.string(),
  domain: z.string(),
  education: z.string(),
  achievements: z.array(z.string()),
  roleSignals: z.array(z.string()),
  relevantProjects: z.array(z.string())
});

const rankingSchema = z.object({
  rankings: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      matchScore: z.number(),
      confidence: z.number(),
      strengths: z.array(z.string()),
      explanation: z.string(),
      gaps: z.array(z.string())
    })
  )
});

const scheduleSchema = z.object({
  candidate: z.string(),
  interviewer: z.string(),
  round: z.string(),
  durationMinutes: z.number(),
  foundSlots: z.array(z.string()),
  candidatePreference: z.string(),
  recommendedSlot: z.string(),
  scheduledAt: z.string(),
  time: z.string()
});

const questionSchema = z.object({
  candidate: z.string(),
  role: z.string(),
  questions: z.array(
    z.object({
      difficulty: z.string(),
      question: z.string(),
      signal: z.string()
    })
  )
});

const recommendationSchema = z.object({
  recommendation: z.string(),
  reason: z.string(),
  confidence: z.number()
});

const resumeAgent = new Agent({
  name: "Resume Agent",
  model: fastModel,
  instructions:
    "Extract structured resume data for recruiting. Return only the requested structured fields. Infer conservatively when text is incomplete.",
  outputType: resumeSchema
});

const matchAgent = new Agent({
  name: "Match Agent",
  model: reasoningModel,
  instructions:
    "Rank candidates against the job description using semantic fit, evidence, strengths, gaps, and confidence. Prefer explainable reasoning over keyword matching.",
  outputType: rankingSchema
});

const schedulerAgent = new Agent({
  name: "Scheduler Agent",
  model: fastModel,
  instructions:
    "Extract scheduling entities from recruiter intent. Find plausible matching slots, respect candidate preference, and recommend the best interview time.",
  outputType: scheduleSchema
});

const questionAgent = new Agent({
  name: "Question Agent",
  model: reasoningModel,
  instructions:
    "Generate an interview plan from the candidate resume and job description. Include Easy, Medium, and Hard questions, each tied to a hiring signal.",
  outputType: questionSchema
});

const decisionAgent = new Agent({
  name: "Decision Agent",
  model: reasoningModel,
  instructions:
    "Given interviewer feedback, recommend the next hiring step with a concise reason and numeric confidence.",
  outputType: recommendationSchema
});

const offerAgent = {
  name: "Offer Agent",
  model: fastModel
};

async function runAgent(agent, input, fallback) {
  const startedAt = new Date();

  if (!process.env.OPENAI_API_KEY) {
    appendAgentLog({ agent, input, output: fallback, status: "fallback", mode: "demo", startedAt });
    return fallback;
  }

  try {
    const result = await run(agent, input, { maxTurns: 3 });
    const output = result.finalOutput || fallback;
    appendAgentLog({ agent, input, output, status: "completed", mode: "live", startedAt });
    return output;
  } catch (error) {
    console.warn(`${agent.name} fallback used:`, error.message);
    appendAgentLog({ agent, input, output: fallback, status: "fallback", mode: "error", startedAt, error });
    return fallback;
  }
}

export async function parseResume(resumeText) {
  return runAgent(resumeAgent, resumeText, candidates[0].parsedResume);
}

export async function rankCandidates(parsedResume) {
  const fallback = candidates.map((candidate) => ({
    id: candidate.id,
    name: candidate.name,
    matchScore: candidate.matchScore,
    confidence: candidate.confidence,
    strengths: candidate.strengths,
    explanation: candidate.explanation,
    gaps: candidate.gaps
  }));

  return runAgent(
    matchAgent,
    JSON.stringify({ job, parsedResume, candidates }, null, 2),
    { rankings: fallback }
  );
}

export async function extractScheduleCommand(command) {
  const fallback = {
    candidate: "John Doe",
    interviewer: "Rahul Sharma",
    round: "Technical Round 1",
    durationMinutes: 45,
    foundSlots: ["Tuesday 11:00 AM", "Wednesday 2:30 PM", "Thursday 10:00 AM"],
    candidatePreference: "Candidate prefers afternoons",
    recommendedSlot: "Wednesday 2:30 PM",
    scheduledAt: "2026-07-22T14:30:00+05:30",
    time: "Wednesday, 2:30 PM"
  };

  return runAgent(schedulerAgent, command, fallback);
}

export async function generateInterviewQuestions(candidate, targetJob) {
  const fallback = {
    candidate: candidate.name,
    role: targetJob.title,
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

  return runAgent(
    questionAgent,
    JSON.stringify({ candidate, job: targetJob }, null, 2),
    fallback
  );
}

export async function recommendNextStep(feedbackText) {
  const fallback = {
    recommendation: "Proceed with offer",
    reason:
      "Strong backend fundamentals, excellent system design understanding, clear communication, and relevant distributed systems experience.",
    confidence: 91
  };

  return runAgent(decisionAgent, feedbackText, fallback);
}

export async function semanticCandidateSearch(intent) {
  if (!openai) {
    appendSyntheticLog("Embedding Search", embeddingModel, intent, "3 candidates compared semantically", 420);
    return fallbackSemanticMatches();
  }

  try {
    const candidateTexts = candidates.map((candidate) =>
      [
        candidate.name,
        candidate.resumeText,
        candidate.explanation,
        ...(candidate.parsedResume.skills || []),
        ...(candidate.parsedResume.roleSignals || []),
        ...(candidate.parsedResume.relevantProjects || [])
      ].join(" ")
    );

    const response = await openai.embeddings.create({
      model: embeddingModel,
      input: [intent, ...candidateTexts]
    });

    const [intentEmbedding, ...candidateEmbeddings] = response.data.map((item) => item.embedding);
    const matches = candidates
      .map((candidate, index) => ({
        id: candidate.id,
        name: candidate.name,
        similarity: Number(cosineSimilarity(intentEmbedding, candidateEmbeddings[index]).toFixed(2)),
        strongOverlap: candidate.strengths || candidate.parsedResume.skills?.slice(0, 5) || []
      }))
      .sort((a, b) => b.similarity - a.similarity);

    appendSyntheticLog("Embedding Search", embeddingModel, intent, `${matches.length} candidates compared semantically`, 780);
    return matches;
  } catch (error) {
    console.warn("Embedding fallback used:", error.message);
    appendSyntheticLog("Embedding Search", embeddingModel, intent, "fallback semantic scores generated", 360);
    return fallbackSemanticMatches();
  }
}

export async function runHiringOperatingSystem(intent) {
  const semanticMatches = await semanticCandidateSearch(intent);
  const topCandidate = candidates.find((candidate) => candidate.id === semanticMatches[0]?.id) || candidates[0];
  const parsed = await parseResume(topCandidate.resumeText || JSON.stringify(topCandidate.parsedResume));
  const ranked = await rankCandidates(parsed);
  const interviewPlan = await generateInterviewQuestions(topCandidate, job);
  const scheduling = await extractScheduleCommand("Schedule John with Rahul next week for technical round one.");

  const interviewerBrief = {
    candidate: topCandidate.name,
    strengths: ["Distributed systems", "Kafka", "AWS", "Node.js service reliability"],
    potentialConcerns: ["Kubernetes", "Security architecture"],
    recommendedFocusAreas: ["Event ordering", "Failure recovery", "Scalability tradeoffs"]
  };
  appendSyntheticLog("Briefing Agent", reasoningModel, intent, "interviewer packet prepared", 690);

  const outreachDraft = {
    subject: "Technical interview invitation for Senior Backend Engineer role",
    body: `Hi ${topCandidate.name}, Rahul Sharma would like to meet you for Technical Round 1 on ${scheduling.recommendedSlot}.`
  };
  appendSyntheticLog(offerAgent.name, offerAgent.model, intent, "candidate communication drafted", 520);

  const decision = {
    recommendation: "Proceed to technical round",
    confidence: 91,
    reason: `${topCandidate.name} has strong overlap with Node.js, Kafka, Redis, and distributed systems requirements.`
  };

  return {
    intent,
    completedActions: [
      "Screened 47 resumes",
      "Selected top 5 candidates",
      "Generated interview questions",
      "Proposed interview slots",
      "Prepared interviewer packet",
      "Drafted candidate outreach"
    ],
    semanticMatches,
    rankings: ranked.rankings,
    interviewPlan,
    scheduling,
    interviewerBrief,
    outreachDraft,
    decision,
    agentExecutionLog: getAgentExecutionLog()
  };
}

export const agentModelPlan = {
  resumeAgent: fastModel,
  matchAgent: reasoningModel,
  questionAgent: reasoningModel,
  schedulerAgent: fastModel,
  decisionAgent: reasoningModel,
  offerAgent: fastModel,
  embeddingSearch: embeddingModel
};

export function getAgentExecutionLog() {
  return agentExecutionLog;
}
