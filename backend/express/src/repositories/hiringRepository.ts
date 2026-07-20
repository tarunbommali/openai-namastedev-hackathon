import mongoose from "mongoose";
import { Application } from "../models/Application";
import { Candidate, ICandidate } from "../models/Candidate";
import { ExecutionLog, IAgentTrace } from "../models/ExecutionLog";
import { Feedback } from "../models/Feedback";
import { Interview } from "../models/Interview";
import { Job } from "../models/Job";
import { Offer } from "../models/Offer";

export const hiringRepository = {
  // ─── Jobs ──────────────────────────────────────────────────────────────────

  getPrimaryJob() {
    return Job.findOne({ isActive: true }).sort({ createdAt: 1 });
  },

  /** List active jobs — optionally scoped to an organization */
  listJobs(organizationId?: string) {
    const filter: Record<string, unknown> = { isActive: true };
    if (organizationId) filter.organizationId = new mongoose.Types.ObjectId(organizationId);
    return Job.find(filter).sort({ createdAt: -1 });
  },

  /** List ALL jobs (active + inactive) — optionally org-scoped */
  listAllJobs(organizationId?: string) {
    const filter: Record<string, unknown> = {};
    if (organizationId) filter.organizationId = new mongoose.Types.ObjectId(organizationId);
    return Job.find(filter).sort({ createdAt: -1 });
  },

  createJob(data: Partial<{
    publicId: string;
    title: string;
    location: string;
    team: string;
    summary: string;
    requirements: string[];
    createdBy: unknown;
    organizationId: unknown;
  }>) {
    return Job.create(data);
  },

  findJob(publicId: string) {
    return Job.findOne({ publicId });
  },

  // ─── Candidates ────────────────────────────────────────────────────────────

  /** List candidates — for recruiters, pass organizationId to scope by org's jobs */
  listCandidates(organizationId?: string) {
    if (!organizationId) {
      return Candidate.find().sort({ matchScore: -1 });
    }
    // Scope: only candidates who have applied to this org's jobs
    return Application.distinct("candidateId", {
      organizationId: new mongoose.Types.ObjectId(organizationId)
    }).then((candidateIds) =>
      Candidate.find({ publicId: { $in: candidateIds } }).sort({ matchScore: -1 })
    );
  },

  findCandidate(publicId: string) {
    return Candidate.findOne({ publicId });
  },

  findCandidateByUserId(userId: string) {
    return Candidate.findOne({ userId });
  },

  findCandidateByEmail(email: string) {
    return Candidate.findOne({ email: email.toLowerCase() });
  },

  async upsertCandidate(publicId: string, data: Partial<ICandidate>) {
    return Candidate.findOneAndUpdate({ publicId }, { $set: data }, { upsert: true, new: true });
  },

  // ─── Applications ──────────────────────────────────────────────────────────

  createApplication(data: {
    publicId: string;
    candidateId: string;
    jobId: string;
    organizationId?: unknown;
    status?: string;
    matchScore?: number;
    resumeScore?: number;
  }) {
    return Application.create(data);
  },

  /** List applications — optionally org-scoped for company-side queries */
  listApplications(organizationId?: string) {
    const filter: Record<string, unknown> = {};
    if (organizationId) filter.organizationId = new mongoose.Types.ObjectId(organizationId);
    return Application.find(filter).sort({ createdAt: -1 });
  },

  listApplicationsForCandidate(candidateId: string) {
    return Application.find({ candidateId }).sort({ createdAt: -1 });
  },

  // ─── Interviews ────────────────────────────────────────────────────────────

  listInterviews() {
    return Interview.find().sort({ createdAt: -1 });
  },

  listInterviewsForCandidate(candidateId: string) {
    return Interview.find({ candidateId }).sort({ createdAt: -1 });
  },

  listInterviewsForInterviewer(userId: string, interviewerName?: string) {
    const or: Record<string, unknown>[] = [{ interviewerUserId: userId }];
    if (interviewerName) or.push({ interviewer: new RegExp(interviewerName, "i") });
    return Interview.find({ $or: or }).sort({ createdAt: -1 });
  },

  createInterview(data: {
    publicId: string;
    candidateId: string;
    candidate: string;
    interviewer: string;
    interviewerUserId?: unknown;
    jobId?: string;
    round: string;
    time: string;
    status?: string;
    joinLink?: string;
  }) {
    return Interview.create(data);
  },

  // ─── Feedback ──────────────────────────────────────────────────────────────

  listFeedback() {
    return Feedback.find().sort({ createdAt: -1 });
  },

  createFeedback(data: Record<string, unknown>) {
    return Feedback.create(data);
  },

  // ─── Offers ────────────────────────────────────────────────────────────────

  createOffer(data: Record<string, unknown>) {
    return Offer.create(data);
  },

  listOffers() {
    return Offer.find().sort({ createdAt: -1 });
  },

  listOffersForCandidate(candidateId: string) {
    return Offer.find({ candidateId }).sort({ createdAt: -1 });
  },

  // ─── Rankings ──────────────────────────────────────────────────────────────

  async saveRankings(candidates: Array<Record<string, unknown>>) {
    for (const c of candidates) {
      const id = String(c.id || c.publicId);
      await Candidate.findOneAndUpdate(
        { publicId: id },
        {
          $set: {
            publicId: id,
            name: c.name,
            email: c.email,
            status: c.status || "Ranked",
            resumeText: c.resumeText,
            parsedResume: c.parsedResume,
            matchScore: c.matchScore,
            confidence: c.confidence,
            explanation: c.explanation,
            strengths: c.strengths,
            gaps: c.gaps
          }
        },
        { upsert: true }
      );
    }
    return this.listCandidates();
  },

  // ─── Execution Logs ────────────────────────────────────────────────────────

  async saveExecutionLog(payload: {
    executionId: string;
    status: string;
    totalDurationMs?: number;
    tokenUsage?: number;
    traces: IAgentTrace[];
    raw?: Record<string, unknown>;
  }) {
    return ExecutionLog.findOneAndUpdate(
      { executionId: payload.executionId },
      { $set: payload },
      { upsert: true, new: true }
    );
  },

  latestTraces(limit = 30) {
    return ExecutionLog.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .then((docs) => {
        const traces: IAgentTrace[] = [];
        for (const doc of docs) {
          for (const t of doc.traces || []) traces.push(t);
          if (traces.length >= limit) break;
        }
        return traces.slice(0, limit);
      });
  },

  listExecutionLogs(filter: { agent?: string; status?: string; limit?: number } = {}) {
    const q: Record<string, unknown> = {};
    if (filter.status) q.status = filter.status;
    if (filter.agent) q["traces.agent"] = filter.agent;
    return ExecutionLog.find(q).sort({ createdAt: -1 }).limit(filter.limit || 50);
  }
};
