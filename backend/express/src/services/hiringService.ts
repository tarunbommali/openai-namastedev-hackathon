import { env } from "../config/env";
import { aiServiceClient } from "../clients/aiServiceClient";
import { hiringRepository } from "../repositories/hiringRepository";
import { AppError } from "../utils/errors";
import { agentModelPlan, emptyTrace } from "./fallbackData";
import { IAgentTrace } from "../models/ExecutionLog";

function candidateDto(c: {
  publicId: string;
  name: string;
  email?: string;
  status?: string;
  resumeText?: string;
  parsedResume?: unknown;
  matchScore?: number;
  confidence?: number;
  explanation?: string;
  strengths?: string[];
  gaps?: string[];
}) {
  return {
    id: c.publicId,
    name: c.name,
    email: c.email || "",
    status: c.status || "Ranked",
    resumeText: c.resumeText || "",
    parsedResume: c.parsedResume,
    matchScore: c.matchScore || 0,
    confidence: c.confidence || 0,
    explanation: c.explanation || "",
    strengths: c.strengths || [],
    gaps: c.gaps || []
  };
}

function jobDto(job: {
  publicId: string;
  title: string;
  location: string;
  team: string;
  summary: string;
  requirements: string[];
}) {
  return {
    id: job.publicId,
    title: job.title,
    location: job.location,
    team: job.team,
    summary: job.summary,
    requirements: job.requirements || []
  };
}

async function persistTraces(executionId: string | undefined, traces: IAgentTrace[], raw?: Record<string, unknown>) {
  if (!traces?.length) return;
  await hiringRepository.saveExecutionLog({
    executionId: executionId || `exec-${Date.now()}`,
    status: "completed",
    traces,
    raw
  });
}

async function callAi<T>(fn: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (!env.ALLOW_AI_FALLBACK) throw error;
    console.warn("AI fallback engaged:", (error as Error).message);
    return fallback();
  }
}

export const hiringService = {
  async getOverview() {
    const job = await hiringRepository.getPrimaryJob();
    const candidates = await hiringRepository.listCandidates();
    const interviews = await hiringRepository.listInterviews();
    const feedback = await hiringRepository.listFeedback();
    const logs = await hiringRepository.latestTraces(30);
    return {
      job: job ? jobDto(job) : null,
      candidates: candidates.map(candidateDto),
      interviewers: [{ id: "int-rahul", name: "Rahul Sharma", role: "Senior Staff Engineer", focus: "Technical Round 1" }],
      interviews: interviews.map((i) => ({
        id: i.publicId,
        candidateId: i.candidateId,
        candidate: i.candidate,
        interviewer: i.interviewer,
        round: i.round,
        time: i.time,
        status: i.status
      })),
      feedback,
      parsedResume: candidates[0]?.parsedResume || null,
      agentModelPlan,
      agentExecutionLog: logs
    };
  },
  async demo() {
    return this.getOverview();
  },

  async agentLogs() {
    return hiringRepository.latestTraces(50);
  },

  async adminAiLogs(query: { agent?: string; status?: string; limit?: number }) {
    return hiringRepository.listExecutionLogs(query);
  },

  async parseResume(resumeText: string) {
    const job = await hiringRepository.getPrimaryJob();
    const candidates = (await hiringRepository.listCandidates()).map(candidateDto);
    const ai = await callAi(
      () => aiServiceClient.parseResume({ resumeText, job: job ? jobDto(job) : undefined, candidates }),
      () => ({
        parsedResume: candidates[0]?.parsedResume,
        rankings: candidates.map((c) => ({
          id: c.id,
          name: c.name,
          matchScore: c.matchScore,
          confidence: c.confidence,
          strengths: c.strengths,
          explanation: c.explanation,
          gaps: c.gaps
        })),
        agentExecutionLog: [emptyTrace("Resume Agent"), emptyTrace("Match Agent")],
        executionId: `fallback-${Date.now()}`
      })
    );

    const base = await hiringRepository.listCandidates();
    const ranked = base
      .map((c) => {
        const hit = (ai.rankings || []).find(
          (r: { id?: string; name?: string }) => r.id === c.publicId || r.name === c.name
        );
        return hit
          ? {
              ...candidateDto(c),
              ...hit,
              id: c.publicId,
              parsedResume: c.publicId === "cand-john" ? ai.parsedResume || c.parsedResume : c.parsedResume
            }
          : candidateDto(c);
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    await hiringRepository.saveRankings(ranked);
    if (ai.parsedResume) {
      await hiringRepository.upsertCandidate("cand-john", {
        parsedResume: ai.parsedResume,
        resumeText,
        status: "Parsed and ranked"
      } as never);
    }
    await persistTraces(ai.executionId, ai.agentExecutionLog || [], ai);

    const fresh = (await hiringRepository.listCandidates()).map(candidateDto);
    return {
      parsedResume: ai.parsedResume || fresh[0]?.parsedResume,
      rankings: fresh,
      agentExecutionLog: ai.agentExecutionLog || [],
      message: "Resume parsed and candidates ranked"
    };
  },

  /** Authenticated candidate apply: parse → rank → Application row → scoped status */
  async applyAsCandidate(user: { _id: unknown; name: string; email: string }, resumeText: string) {
    const job = await hiringRepository.getPrimaryJob();
    if (!job) throw new AppError(500, "No active job to apply to");

    let candidate = await hiringRepository.findCandidateByUserId(String(user._id));
    if (!candidate) {
      const slug = user.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "cand";
      candidate = await hiringRepository.upsertCandidate(`cand-${slug}-${String(user._id).slice(-6)}`, {
        userId: user._id as never,
        name: user.name,
        email: user.email,
        status: "Applying"
      } as never);
    }

    const peers = (await hiringRepository.listCandidates()).map(candidateDto);
    const ai = await callAi(
      () =>
        aiServiceClient.parseResume({
          resumeText,
          job: jobDto(job),
          candidates: peers
        }),
      () => ({
        parsedResume: {
          name: user.name,
          skills: ["Backend engineering"],
          experienceYears: 0,
          seniority: "Mid",
          domain: "General",
          education: "",
          achievements: [],
          roleSignals: [],
          relevantProjects: []
        },
        rankings: peers,
        agentExecutionLog: [emptyTrace("Resume Agent"), emptyTrace("Match Agent")],
        executionId: `fallback-${Date.now()}`
      })
    );

    const ownRanking = (ai.rankings || []).find(
      (r: { id?: string; name?: string }) => r.id === candidate!.publicId || r.name === user.name
    );
    const matchScore = ownRanking?.matchScore ?? 70;

    await hiringRepository.upsertCandidate(candidate.publicId, {
      parsedResume: ai.parsedResume,
      resumeText,
      status: "Applied",
      matchScore,
      confidence: ownRanking?.confidence ?? matchScore,
      strengths: ownRanking?.strengths || [],
      gaps: ownRanking?.gaps || [],
      explanation: ownRanking?.explanation || "Application submitted"
    } as never);

    const application = await hiringRepository.createApplication({
      publicId: `app-${Date.now()}`,
      candidateId: candidate.publicId,
      jobId: job.publicId,
      status: "Applied",
      matchScore
    });

    await persistTraces(ai.executionId, ai.agentExecutionLog || [], ai);

    return {
      application: {
        id: application.publicId,
        candidateId: application.candidateId,
        jobId: application.jobId,
        status: application.status,
        matchScore: application.matchScore
      },
      parsedResume: ai.parsedResume,
      rankings: (await hiringRepository.listCandidates()).map(candidateDto),
      agentExecutionLog: ai.agentExecutionLog || [],
      message: "Application submitted and resume screened"
    };
  },

  async candidatePortal(userId: string) {
    const candidate = await hiringRepository.findCandidateByUserId(userId);
    if (!candidate) {
      return { candidate: null, applications: [], interviews: [], offers: [] };
    }
    const [applications, interviews, offers] = await Promise.all([
      hiringRepository.listApplicationsForCandidate(candidate.publicId),
      hiringRepository.listInterviewsForCandidate(candidate.publicId),
      hiringRepository.listOffersForCandidate(candidate.publicId)
    ]);
    return {
      candidate: candidateDto(candidate),
      applications,
      interviews,
      offers
    };
  },

  async runCommand(intent: string, idempotencyKey?: string) {
    if (idempotencyKey) {
      const logs = await hiringRepository.listExecutionLogs({ limit: 1 });
      const cachedLog = logs.find
        ? logs.find((l: { executionId: string; raw?: Record<string, unknown> }) => l.executionId === idempotencyKey)
        : undefined;
      if (cachedLog && (cachedLog as { raw?: Record<string, unknown> }).raw) {
        return (cachedLog as { raw: Record<string, unknown> }).raw;
      }
    }
    const job = await hiringRepository.getPrimaryJob();
    const candidates = (await hiringRepository.listCandidates()).map(candidateDto);
    const ai = await callAi(
      () => aiServiceClient.command({ intent, job: job ? jobDto(job) : undefined, candidates }),
      () => ({
        intent,
        completedActions: ["AI unavailable — returned seeded workflow"],
        semanticMatches: candidates.map((c) => ({
          id: c.id,
          name: c.name,
          similarity: c.matchScore / 100,
          strongOverlap: c.strengths.slice(0, 3)
        })),
        rankings: candidates.map((c) => ({
          id: c.id,
          name: c.name,
          matchScore: c.matchScore,
          confidence: c.confidence,
          strengths: c.strengths,
          explanation: c.explanation,
          gaps: c.gaps
        })),
        interviewPlan: {
          candidate: candidates[0]?.name,
          role: job?.title,
          questions: []
        },
        scheduling: {
          candidate: candidates[0]?.name || "John Doe",
          interviewer: "Rahul Sharma",
          round: "Technical Round 1",
          durationMinutes: 45,
          foundSlots: ["Wednesday 2:30 PM"],
          candidatePreference: "Afternoons",
          recommendedSlot: "Wednesday 2:30 PM",
          scheduledAt: new Date().toISOString(),
          time: "Wednesday 2:30 PM"
        },
        interviewerBrief: {
          candidate: candidates[0]?.name,
          strengths: candidates[0]?.strengths || [],
          potentialConcerns: candidates[0]?.gaps || [],
          recommendedFocusAreas: []
        },
        outreachDraft: {
          subject: `Interview invitation for ${job?.title || "role"}`,
          body: `Hi ${candidates[0]?.name}, please confirm your interview slot.`
        },
        decision: {
          recommendation: "Proceed to technical round",
          confidence: 80,
          reason: "Fallback decision while AI service is unavailable"
        },
        agentExecutionLog: [emptyTrace("Resume Agent")],
        executionId: `fallback-${Date.now()}`
      })
    );

    if (ai.rankings?.length) {
      const base = await hiringRepository.listCandidates();
      const merged = base.map((c) => {
        const hit = ai.rankings.find(
          (r: { id?: string; name?: string }) => r.id === c.publicId || r.name === c.name
        );
        return hit ? { ...candidateDto(c), ...hit, id: c.publicId } : candidateDto(c);
      });
      await hiringRepository.saveRankings(merged);
    }
    await persistTraces(ai.executionId, ai.agentExecutionLog || [], ai);
    return { ...ai, agentExecutionLog: ai.agentExecutionLog || [] };
  },

  async questions(candidateId?: string) {
    const job = await hiringRepository.getPrimaryJob();
    const candidates = await hiringRepository.listCandidates();
    const candidate = candidates.find((c) => c.publicId === candidateId) || candidates[0];
    if (!job || !candidate) throw new AppError(404, "Candidate or job not found");

    const ai = await callAi(
      () => aiServiceClient.questions({ candidate: candidateDto(candidate), job: jobDto(job) }),
      () => ({
        candidate: candidate.name,
        role: job.title,
        questions: [
          {
            difficulty: "Easy",
            question: "How do you structure a production Node.js service?",
            signal: "Fundamentals"
          },
          {
            difficulty: "Medium",
            question: "Design an idempotent Kafka consumer.",
            signal: "Kafka"
          },
          {
            difficulty: "Hard",
            question: "Design a Redis-backed rate limiter.",
            signal: "System design"
          }
        ],
        agentExecutionLog: [emptyTrace("Question Agent")],
        executionId: `fallback-${Date.now()}`
      })
    );
    await persistTraces(ai.executionId, ai.agentExecutionLog || [], ai);
    return { ...ai, agentExecutionLog: ai.agentExecutionLog || [] };
  },

  async schedulePreview(command: string) {
    const candidates = (await hiringRepository.listCandidates()).map(candidateDto);
    const ai = await callAi(
      () => aiServiceClient.schedule({ command, candidates }),
      () => ({
        extractedEntities: {
          candidate: "John Doe",
          interviewer: "Rahul Sharma",
          round: "Technical Round 1",
          durationMinutes: 45,
          foundSlots: ["Wednesday 2:30 PM"],
          candidatePreference: "Afternoons",
          recommendedSlot: "Wednesday 2:30 PM",
          scheduledAt: new Date().toISOString(),
          time: "Wednesday 2:30 PM"
        },
        agentExecutionLog: [emptyTrace("Scheduler Agent")],
        executionId: `fallback-${Date.now()}`
      })
    );
    await persistTraces(ai.executionId, ai.agentExecutionLog || [], ai);
    return {
      command,
      extractedEntities: ai.extractedEntities,
      agentExecutionLog: ai.agentExecutionLog || [],
      message: "Scheduling entities extracted"
    };
  },

  async scheduleConfirm(command: string) {
    const preview = await this.schedulePreview(command);
    const entities = preview.extractedEntities;
    const candidates = await hiringRepository.listCandidates();
    const matched =
      candidates.find((c) =>
        entities.candidate?.toLowerCase().includes(c.name.split(" ")[0].toLowerCase())
      ) || candidates[0];

    const { User } = await import("../models/User");
    const interviewerName = entities.interviewer || "Rahul Sharma";
    const interviewerUser = await User.findOne({
      role: "interviewer",
      name: new RegExp(interviewerName.split(" ")[0], "i")
    });

    const interview = await hiringRepository.createInterview({
      publicId: `iv-${Date.now()}`,
      candidateId: matched?.publicId || "cand-john",
      candidate: entities.candidate || "John Doe",
      interviewer: interviewerName,
      interviewerUserId: interviewerUser?._id,
      round: entities.round || "Technical Round 1",
      time: entities.recommendedSlot || entities.time || "Wednesday 2:30 PM",
      status: "Created"
    } as never);

    return {
      command,
      extractedEntities: entities,
      interview: {
        id: interview.publicId,
        candidateId: interview.candidateId,
        candidate: interview.candidate,
        interviewer: interview.interviewer,
        round: interview.round,
        time: interview.time,
        status: interview.status
      },
      agentExecutionLog: preview.agentExecutionLog,
      message: "Interview created automatically"
    };
  },

  async submitFeedback(feedbackText: string, interviewId?: string) {
    const interviews = await hiringRepository.listInterviews();
    let latest;
    if (interviewId) {
      latest = interviews.find((i) => i.publicId === interviewId);
      if (!latest) throw new AppError(404, "Interview not found");
    } else {
      latest = interviews[0];
    }

    const ai = await callAi(
      () => aiServiceClient.feedback({ feedbackText }),
      () => ({
        recommendation: {
          recommendation: "Recommend next round",
          reason: "Fallback recommendation for recruiter review",
          confidence: 75
        },
        analysis: null,
        agentExecutionLog: [emptyTrace("Feedback Agent"), emptyTrace("Decision Agent")],
        executionId: `fallback-${Date.now()}`
      })
    );

    const recommendation = ai.recommendation || ai.decision || {
      recommendation: "Hold",
      reason: "Incomplete",
      confidence: 50
    };

    const record = await hiringRepository.createFeedback({
      publicId: `fb-${Date.now()}`,
      interviewId: latest?.publicId,
      candidate: latest?.candidate || "John Doe",
      interviewer: latest?.interviewer || "Rahul Sharma",
      feedbackText,
      recommendation
    });

    // Offers are created only by recruiter Hire (portalService.decide) — not on feedback
    await persistTraces(ai.executionId, ai.agentExecutionLog || [], ai);

    return {
      id: record.publicId,
      interviewId: record.interviewId,
      candidate: record.candidate,
      interviewer: record.interviewer,
      feedbackText: record.feedbackText,
      recommendation: record.recommendation,
      analysis: ai.analysis,
      offer: null,
      agentExecutionLog: ai.agentExecutionLog || []
    };
  },

  async listJobs() {
    const jobs = await hiringRepository.listJobs();
    return jobs.map(jobDto);
  },

  async createJob(input: {
    title: string;
    location?: string;
    team?: string;
    summary?: string;
    requirements?: string[];
    createdBy?: string;
    organizationId?: string;
  }) {
    const job = await hiringRepository.createJob({
      publicId: `job-${Date.now()}`,
      title: input.title,
      location: input.location || "",
      team: input.team || "",
      summary: input.summary || "",
      requirements: input.requirements || [],
      createdBy: input.createdBy,
      organizationId: input.organizationId
    });
    return jobDto(job);
  }
};
