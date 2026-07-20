import request from "supertest";
import { createApp } from "./app";

jest.mock("./services/hiringService", () => ({
  hiringService: {
    getOverview: jest.fn(async () => ({
      job: { id: "job-1", title: "Engineer", location: "", team: "", summary: "", requirements: [] },
      candidates: [{ id: "cand-john", name: "John Doe", matchScore: 92 }],
      interviewers: [],
      interviews: [],
      feedback: [],
      parsedResume: { name: "John Doe", skills: ["Node.js"] },
      agentModelPlan: {},
      agentExecutionLog: []
    })),
    demo: jest.fn(async () => ({
      job: { id: "job-1", title: "Engineer", location: "", team: "", summary: "", requirements: [] },
      candidates: [{ id: "cand-john", name: "John Doe", matchScore: 92 }],
      interviewers: [],
      interviews: [],
      feedback: [],
      parsedResume: { name: "John Doe", skills: ["Node.js"] },
      agentModelPlan: {},
      agentExecutionLog: []
    })),
    agentLogs: jest.fn(async () => []),
    listJobs: jest.fn(async () => [{ id: "job-1", title: "Engineer" }]),
    parseResume: jest.fn(async () => ({
      parsedResume: { name: "John Doe", skills: ["Node.js"] },
      rankings: [{ id: "cand-john", name: "John Doe", matchScore: 92 }],
      agentExecutionLog: [],
      message: "Resume parsed and candidates ranked"
    })),
    runCommand: jest.fn(async () => ({
      intent: "hire",
      completedActions: [],
      semanticMatches: [],
      rankings: [],
      interviewPlan: {},
      scheduling: {},
      interviewerBrief: {},
      outreachDraft: {},
      decision: { recommendation: "Hire", reason: "fit", confidence: 90 },
      agentExecutionLog: []
    }))
  }
}));

describe("frontend-compatible routes", () => {
  const app = createApp();

  it("GET /api/health", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.app).toBe("HireFlow AI");
  });

  it("GET /api/jobs contract", async () => {
    const res = await request(app).get("/api/jobs");
    expect(res.status).toBe(200);
  });

  it("POST /api/resumes contract", async () => {
    const res = await request(app)
      .post("/api/resumes")
      .send({ resumeText: "John Doe Node.js Kafka Redis Docker 6 years experience backend" });
    expect(res.status).toBe(200);
    expect(res.body.parsedResume).toBeDefined();
    expect(res.body.rankings).toBeDefined();
    expect(res.body.agentExecutionLog).toBeDefined();
  }, 15000);
});
function expect(agentExecutionLog: any) {
  throw new Error("Function not implemented.");
}

