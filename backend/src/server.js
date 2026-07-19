import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import mongoose from "mongoose";
import { z } from "zod";
import {
  agentModelPlan,
  parseResume,
  rankCandidates,
  extractScheduleCommand,
  generateInterviewQuestions,
  getAgentExecutionLog,
  recommendNextStep,
  runHiringOperatingSystem,
  semanticCandidateSearch
} from "./ai.js";
import { candidates, feedback, interviews, interviewers, job } from "./seed.js";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const textBodySchema = z.object({
  intent: z.string().trim().min(3).max(2000).optional(),
  resumeText: z.string().trim().min(10).max(50000).optional(),
  command: z.string().trim().min(3).max(2000).optional(),
  feedbackText: z.string().trim().min(3).max(10000).optional(),
  candidateId: z.string().trim().min(1).optional(),
  interviewId: z.string().trim().min(1).optional()
});

const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

function parseBody(req, res) {
  const parsed = textBodySchema.safeParse(req.body || {});
  if (parsed.success) return parsed.data;
  res.status(400).json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors });
  return null;
}

let parsedResume = candidates[0].parsedResume;
let rankings = candidates;
let interviewStore = [...interviews];
let feedbackStore = [...feedback];

if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.warn("MongoDB unavailable, using memory store:", error.message));
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, app: "HireFlow AI" });
});

app.get("/api/demo", (_req, res) => {
  res.json({
    job,
    candidates: rankings,
    interviewers,
    interviews: interviewStore,
    feedback: feedbackStore,
    parsedResume,
    agentModelPlan,
    agentExecutionLog: getAgentExecutionLog()
  });
});

app.get("/api/agents/logs", (_req, res) => {
  res.json(getAgentExecutionLog());
});

app.post("/api/command", asyncRoute(async (req, res) => {
  const body = parseBody(req, res);
  if (!body) return;
  const intent =
    body.intent || "Hire a senior backend engineer with Node.js, Kafka, Redis, and distributed systems experience.";
  const result = await runHiringOperatingSystem(intent);

  if (result.rankings?.length) {
    rankings = candidates
      .map((candidate) => {
        const aiRank = result.rankings.find((item) => item.id === candidate.id || item.name === candidate.name);
        return aiRank ? { ...candidate, ...aiRank } : candidate;
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  res.json(result);
}));

app.post("/api/candidates/search", asyncRoute(async (req, res) => {
  const body = parseBody(req, res);
  if (!body) return;
  const intent =
    body.intent || "Senior backend engineer with Node.js, Kafka, Redis, and distributed systems experience.";
  const matches = await semanticCandidateSearch(intent);
  res.json({ matches, agentExecutionLog: getAgentExecutionLog() });
}));

app.get("/api/jobs", (_req, res) => {
  res.json([job]);
});

app.post("/api/resumes", upload.single("resume"), asyncRoute(async (req, res) => {
  const body = parseBody(req, res);
  if (!body) return;
  const fallbackText = candidates[0].resumeText;
  const textFromBody = body.resumeText;
  const textFromFile = req.file?.buffer?.toString("utf8");
  const resumeText = textFromBody || textFromFile || fallbackText;

  parsedResume = await parseResume(resumeText);
  const ranked = await rankCandidates(parsedResume);

  rankings = candidates
    .map((candidate) => {
      const aiRank = ranked.rankings?.find((item) => item.id === candidate.id || item.name === candidate.name);
      return aiRank ? { ...candidate, ...aiRank } : candidate;
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  res.json({
    parsedResume,
    rankings,
    agentExecutionLog: getAgentExecutionLog(),
    message: "Resume parsed and candidates ranked"
  });
}));

app.get("/api/applications", (_req, res) => {
  res.json(rankings);
});

app.get("/api/applications/:id", (req, res) => {
  const candidate = rankings.find((item) => item.id === req.params.id);
  if (!candidate) return res.status(404).json({ error: "Candidate not found" });
  res.json({ candidate, job });
});

app.post("/api/questions", asyncRoute(async (req, res) => {
  const body = parseBody(req, res);
  if (!body) return;
  const candidate = rankings.find((item) => item.id === body.candidateId) || rankings[0];
  const questionSet = await generateInterviewQuestions(candidate, job);
  res.json({ ...questionSet, agentExecutionLog: getAgentExecutionLog() });
}));

app.post("/api/interviews/preview", asyncRoute(async (req, res) => {
  const body = parseBody(req, res);
  if (!body) return;
  const command = body.command || "Schedule a 45-minute technical interview next week with available backend interviewers.";
  const extractedEntities = await extractScheduleCommand(command);

  res.json({
    command,
    extractedEntities,
    agentExecutionLog: getAgentExecutionLog(),
    message: "Scheduling entities extracted"
  });
}));

app.post("/api/interviews/schedule", asyncRoute(async (req, res) => {
  const body = parseBody(req, res);
  if (!body) return;
  const command = body.command || "Schedule a 45-minute technical interview next week with available backend interviewers.";
  const entities = await extractScheduleCommand(command);
  const candidate = rankings.find((item) => entities.candidate?.toLowerCase().includes(item.name.split(" ")[0].toLowerCase()));

  const interview = {
    id: `iv-${Date.now()}`,
    candidateId: candidate?.id || "cand-john",
    candidate: entities.candidate || "John Doe",
    interviewer: entities.interviewer || "Rahul Sharma",
    round: entities.round || "Technical Round 1",
    time: entities.recommendedSlot || entities.time || "Wednesday, 2:30 PM",
    status: "Created"
  };

  interviewStore = [interview, ...interviewStore];

  res.json({
    command,
    extractedEntities: entities,
    interview,
    agentExecutionLog: getAgentExecutionLog(),
    message: "Interview created automatically"
  });
}));

app.get("/api/interviews", (_req, res) => {
  res.json(interviewStore);
});

app.post("/api/feedback", asyncRoute(async (req, res) => {
  const body = parseBody(req, res);
  if (!body) return;
  const feedbackText =
    body.feedbackText || "Strong backend fundamentals, excellent system design understanding, strong communication, and relevant distributed systems experience.";
  const recommendation = await recommendNextStep(feedbackText);
  const latestInterview = interviewStore[0];

  const record = {
    id: `fb-${Date.now()}`,
    interviewId: body.interviewId || latestInterview?.id,
    candidate: latestInterview?.candidate || "John Doe",
    interviewer: latestInterview?.interviewer || "Rahul Sharma",
    feedbackText,
    recommendation
  };

  feedbackStore = [record, ...feedbackStore];

  res.json({ ...record, agentExecutionLog: getAgentExecutionLog() });
}));

app.use((error, _req, res, _next) => {
  console.error("Unhandled API error:", error);
  res.status(500).json({ error: "Unable to complete the hiring workflow. Please try again." });
});

const server = app.listen(port, () => {
  console.log(`HireFlow AI backend running on http://localhost:${port}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop the process using it, then restart HireFlow AI.`);
    return;
  }
  console.error("Unable to start HireFlow AI backend:", error);
});
