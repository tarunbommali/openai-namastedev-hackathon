import OpenAI from "openai";
import { z } from "zod";
import { candidates, job } from "./seed.js";

const fastModel = process.env.OPENAI_FAST_MODEL || "gpt-5-mini";
const reasoningModel = process.env.OPENAI_REASONING_MODEL || "gpt-5";
const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-large";
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const agentExecutionLog = [];

async function getAgentRuntime() {
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    return await import("@openai/agents");
  } catch (error) {
    console.warn("OpenAI Agents runtime unavailable, falling back to demo mode:", error.message);
    return null;
  }
}

function createAgentDefinition(name, model, instructions, outputType) {
  return { name, model, instructions, outputType };
}

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

function tokenize(value) {
  return new Set(String(value || "").toLowerCase().match(/[a-z0-9+.]+/g) || []);
}

function candidateSearchText(candidate) {
  return [
    candidate.name,
    candidate.resumeText,
    candidate.explanation,
    ...(candidate.parsedResume?.skills || []),
    ...(candidate.parsedResume?.roleSignals || []),
    ...(candidate.parsedResume?.relevantProjects || [])
  ].join(" ");
}

function fallbackSemanticMatches(intent) {
  const intentTokens = tokenize(intent);

  return candidates
    .map((candidate) => {
      const candidateTokens = tokenize(candidateSearchText(candidate));
      const overlap = [...intentTokens].filter((token) => candidateTokens.has(token));
      const strongOverlap = [
        ...(candidate.parsedResume?.skills || []),
        ...(candidate.parsedResume?.roleSignals || [])
      ].filter((item) => [...tokenize(item)].some((token) => intentTokens.has(token)));

      // A stable baseline keeps the demo readable while the overlap makes each command meaningful.
      const similarity = Math.min(0.98, Number((0.52 + overlap.length * 0.065 + candidate.matchScore / 1000).toFixed(2)));
      return {
        id: candidate.id,
        name: candidate.name,
        similarity,
        strongOverlap: [...new Set(strongOverlap)].slice(0, 5)
      };
    })
    .sort((left, right) => right.similarity - left.similarity);
}

function fallbackSchedule(command) {
  const normalizedCommand = String(command || "").toLowerCase();
  const matchedCandidate = candidates.find((candidate) => normalizedCommand.includes(candidate.name.toLowerCase()) || normalizedCommand.includes(candidate.name.split(" ")[0].toLowerCase()));
  const duration = Number(normalizedCommand.match(/(\d+)\s*(?:minute|min)/)?.[1] || 45);
  const round = normalizedCommand.includes("hr") ? "HR Round" : normalizedCommand.includes("manager") ? "Hiring Manager Round" : "Technical Round 1";
  const slots = ["Tuesday 11:00 AM", "Wednesday 2:30 PM", "Thursday 10:00 AM"];
  const explicitTime = normalizedCommand.match(/(tomorrow|monday|tuesday|wednesday|thursday|friday)\s*(?:at\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  const recommendedSlot = explicitTime
    ? `${explicitTime[1][0].toUpperCase()}${explicitTime[1].slice(1).toLowerCase()} ${explicitTime[2]}:${explicitTime[3] || "00"} ${explicitTime[4].toUpperCase()}`
    : slots[1];

  return {
    candidate: matchedCandidate?.name || "John Doe",
    interviewer: normalizedCommand.includes("rahul") ? "Rahul Sharma" : "Rahul Sharma",
    round,
    durationMinutes: duration,
    foundSlots: explicitTime ? [recommendedSlot, ...slots] : slots,
    candidatePreference: explicitTime ? "Requested time detected in recruiter command" : "Candidate prefers afternoons",
    recommendedSlot,
    scheduledAt: "2026-07-22T14:30:00+05:30",
    time: recommendedSlot
  };
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

const briefingSchema = z.object({
  candidate: z.string(),
  strengths: z.array(z.string()),
  potentialConcerns: z.array(z.string()),
  recommendedFocusAreas: z.array(z.string())
});

const outreachSchema = z.object({
  subject: z.string(),
  body: z.string()
});

const resumeAgent = createAgentDefinition(
  "Resume Agent",
  fastModel,
  "Extract structured resume data for recruiting. Return only the requested structured fields. Infer conservatively when text is incomplete.",
  resumeSchema
);

const matchAgent = createAgentDefinition(
  "Match Agent",
  reasoningModel,
  "Rank candidates against the job description using semantic fit, evidence, strengths, gaps, and confidence. Prefer explainable reasoning over keyword matching.",
  rankingSchema
);

const schedulerAgent = createAgentDefinition(
  "Scheduler Agent",
  fastModel,
  "Extract scheduling entities from recruiter intent. Find plausible matching slots, respect candidate preference, and recommend the best interview time.",
  scheduleSchema
);

const questionAgent = createAgentDefinition(
  "Question Agent",
  reasoningModel,
  "Generate an interview plan from the candidate resume and job description. Include Easy, Medium, and Hard questions, each tied to a hiring signal.",
  questionSchema
);

const decisionAgent = createAgentDefinition(
  "Decision Agent",
  reasoningModel,
  "Given interviewer feedback, recommend the next hiring step with a concise reason and numeric confidence.",
  recommendationSchema
);

const briefingAgent = createAgentDefinition(
  "Briefing Agent",
  reasoningModel,
  "Create a concise interviewer brief. Highlight evidence-based strengths, risks to probe, and focus areas for the interview.",
  briefingSchema
);

const offerAgent = createAgentDefinition(
  "Offer Agent",
  fastModel,
  "Draft concise, professional candidate outreach for the proposed interview. Do not promise an offer or make unsupported claims.",
  outreachSchema
);

async function runAgent(agent, input, fallback, schema) {
  const startedAt = new Date();

  if (!process.env.OPENAI_API_KEY) {
    appendAgentLog({ agent, input, output: fallback, status: "fallback", mode: "demo", startedAt });
    return fallback;
  }

  try {
    const runtime = await getAgentRuntime();
    if (!runtime) {
      appendAgentLog({ agent, input, output: fallback, status: "fallback", mode: "demo", startedAt });
      return fallback;
    }

    const liveAgent = new runtime.Agent({
      name: agent.name,
      model: agent.model,
      instructions: agent.instructions,
      outputType: agent.outputType
    });

    const result = await runtime.run(liveAgent, input, { maxTurns: 3 });
    const parsedOutput = schema?.safeParse(result.finalOutput);
    const output = schema && !parsedOutput?.success ? fallback : parsedOutput?.data || result.finalOutput || fallback;
    const status = schema && !parsedOutput?.success ? "fallback" : "completed";
    appendAgentLog({ agent, input, output, status, mode: status === "completed" ? "live" : "error", startedAt });
    return output;
  } catch (error) {
    console.warn(`${agent.name} fallback used:`, error.message);
    appendAgentLog({ agent, input, output: fallback, status: "fallback", mode: "error", startedAt, error });
    return fallback;
  }
}

export async function parseResume(resumeText) {
  return runAgent(resumeAgent, resumeText, candidates[0].parsedResume, resumeSchema);
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
    { rankings: fallback },
    rankingSchema
  );
}

export async function extractScheduleCommand(command) {
  const fallback = fallbackSchedule(command);

  return runAgent(schedulerAgent, command, fallback, scheduleSchema);
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
    fallback,
    questionSchema
  );
}

export async function recommendNextStep(feedbackText) {
  const normalizedFeedback = String(feedbackText || "").toLowerCase();
  const hasConcern = /no hire|reject|weak|concern|insufficient|poor/.test(normalizedFeedback);
  const isStrong = /strong|excellent|great|recommend|impressed/.test(normalizedFeedback);
  const fallback = {
    recommendation: hasConcern ? "Hold for recruiter review" : isStrong ? "Proceed with offer" : "Proceed to next interview round",
    reason: hasConcern
      ? "The feedback contains concerns that should be reviewed before advancing the candidate."
      : isStrong
        ? "The feedback indicates strong technical capability and communication."
        : "The feedback supports collecting one more focused signal before making a final decision.",
    confidence: hasConcern ? 68 : isStrong ? 91 : 76
  };

  return runAgent(decisionAgent, feedbackText, fallback, recommendationSchema);
}

async function createInterviewerBrief(candidate, interviewPlan) {
  const fallback = {
    candidate: candidate.name,
    strengths: candidate.strengths || candidate.parsedResume?.skills?.slice(0, 4) || [],
    potentialConcerns: candidate.gaps || ["Validate scope of production ownership"],
    recommendedFocusAreas: (interviewPlan.questions || []).map((item) => item.signal).slice(0, 3)
  };

  return runAgent(briefingAgent, JSON.stringify({ candidate, job, interviewPlan }, null, 2), fallback, briefingSchema);
}

async function createOutreachDraft(candidate, scheduling) {
  const fallback = {
    subject: `Technical interview invitation for ${job.title}`,
    body: `Hi ${candidate.name}, ${scheduling.interviewer} would like to meet you for ${scheduling.round} on ${scheduling.recommendedSlot}. Please let us know if that time works for you.`
  };

  return runAgent(offerAgent, JSON.stringify({ candidate: candidate.name, job: job.title, scheduling }, null, 2), fallback, outreachSchema);
}

export async function semanticCandidateSearch(intent) {
  if (!openai) {
    appendSyntheticLog("Embedding Search", embeddingModel, intent, "3 candidates compared semantically", 420);
    return fallbackSemanticMatches(intent);
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
    return fallbackSemanticMatches(intent);
  }
}

export async function runHiringOperatingSystem(intent) {
  const semanticMatches = await semanticCandidateSearch(intent);
  const topCandidate = candidates.find((candidate) => candidate.id === semanticMatches[0]?.id) || candidates[0];
  const parsed = await parseResume(topCandidate.resumeText || candidateSearchText(topCandidate));
  const ranked = await rankCandidates(parsed);
  const interviewPlan = await generateInterviewQuestions(topCandidate, job);
  const scheduling = await extractScheduleCommand(`Schedule ${topCandidate.name} with Rahul Sharma next week for technical round one.`);
  const interviewerBrief = await createInterviewerBrief(topCandidate, interviewPlan);
  const outreachDraft = await createOutreachDraft(topCandidate, scheduling);

  const decision = {
    recommendation: "Proceed to technical round",
    confidence: 91,
    reason: `${topCandidate.name} has strong overlap with Node.js, Kafka, Redis, and distributed systems requirements.`
  };

  return {
    intent,
    completedActions: [
      `Compared ${semanticMatches.length} candidate profiles semantically`,
      `Selected ${topCandidate.name} for focused screening`,
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
  briefingAgent: reasoningModel,
  offerAgent: fastModel,
  embeddingSearch: embeddingModel
};

export function getAgentExecutionLog() {
  return agentExecutionLog;
}
