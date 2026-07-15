import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import mongoose from "mongoose";
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

app.post("/api/command", async (req, res) => {
  const intent =
    req.body.intent || "Hire a senior backend engineer with Node.js, Kafka, Redis, and distributed systems experience.";
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
});

app.post("/api/candidates/search", async (req, res) => {
  const intent =
    req.body.intent || "Senior backend engineer with Node.js, Kafka, Redis, and distributed systems experience.";
  const matches = await semanticCandidateSearch(intent);
  res.json({ matches, agentExecutionLog: getAgentExecutionLog() });
});

app.get("/api/jobs", (_req, res) => {
  res.json([job]);
});

app.post("/api/resumes", upload.single("resume"), async (req, res) => {
  const fallbackText = candidates[0].resumeText;
  const textFromBody = req.body?.resumeText;
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
});

app.get("/api/applications", (_req, res) => {
  res.json(rankings);
});

app.get("/api/applications/:id", (req, res) => {
  const candidate = rankings.find((item) => item.id === req.params.id);
  if (!candidate) return res.status(404).json({ error: "Candidate not found" });
  res.json({ candidate, job });
});

app.post("/api/questions", async (req, res) => {
  const candidate = rankings.find((item) => item.id === req.body.candidateId) || rankings[0];
  const questionSet = await generateInterviewQuestions(candidate, job);
  res.json({ ...questionSet, agentExecutionLog: getAgentExecutionLog() });
});

app.post("/api/interviews/schedule", async (req, res) => {
  const command = req.body.command || "Schedule a 45-minute technical interview next week with available backend interviewers.";
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
});

app.get("/api/interviews", (_req, res) => {
  res.json(interviewStore);
});

app.post("/api/feedback", async (req, res) => {
  const feedbackText =
    req.body.feedbackText || "Strong backend fundamentals, excellent system design understanding, strong communication, and relevant distributed systems experience.";
  const recommendation = await recommendNextStep(feedbackText);
  const latestInterview = interviewStore[0];

  const record = {
    id: `fb-${Date.now()}`,
    interviewId: req.body.interviewId || latestInterview?.id,
    candidate: latestInterview?.candidate || "John Doe",
    interviewer: latestInterview?.interviewer || "Rahul Sharma",
    feedbackText,
    recommendation
  };

  feedbackStore = [record, ...feedbackStore];

  res.json({ ...record, agentExecutionLog: getAgentExecutionLog() });
});

app.listen(port, () => {
  console.log(`HireFlow AI backend running on http://localhost:${port}`);
});
