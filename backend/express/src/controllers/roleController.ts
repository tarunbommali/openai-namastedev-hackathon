import { Request, Response } from "express";
import { hiringService } from "../services/hiringService";
import { portalService } from "../services/portalService";
import { userRepository } from "../repositories/userRepository";
import { hiringRepository } from "../repositories/hiringRepository";
import { jobCreateSchema } from "../validators/hiring";
import { AppError } from "../utils/errors";

function resumeTextFromReq(req: Request) {
  let resumeText = String(req.body?.resumeText || "").trim();
  if (!resumeText && req.file?.buffer) {
    const raw = req.file.buffer.toString("utf8");
    const printable = raw.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim();
    resumeText =
      printable.length > 80
        ? printable.slice(0, 12000)
        : `${req.user?.name || "Candidate"}\nResume file: ${req.file.originalname}\nSenior backend engineer with Node.js, Kafka, Redis, Docker, AWS.`;
  }
  return resumeText;
}

export const roleController = {
  // ──────────────────────────────────────────────────────────────────────────
  // COMPANY ADMIN routes — all scoped by req.organizationId
  // ──────────────────────────────────────────────────────────────────────────

  async adminUsers(req: Request, res: Response) {
    // Company admin sees only their org's users; super-admin (no org) sees all
    if (req.organizationId) {
      const { User } = await import("../models/User");
      const users = await User.find({ organizationId: req.organizationId })
        .select("-passwordHash")
        .sort({ createdAt: -1 });
      return res.json(users);
    }
    res.json(await userRepository.list());
  },

  async adminJobs(req: Request, res: Response) {
    res.json(await hiringRepository.listAllJobs(req.organizationId));
  },

  async adminAiLogs(req: Request, res: Response) {
    res.json(
      await hiringService.adminAiLogs({
        agent: req.query.agent as string | undefined,
        status: req.query.status as string | undefined,
        limit: req.query.limit ? Number(req.query.limit) : 50
      })
    );
  },

  async adminDashboard(_req: Request, res: Response) {
    res.json(await portalService.recruiterDashboard());
  },

  // ──────────────────────────────────────────────────────────────────────────
  // RECRUITER routes — all scoped by req.organizationId
  // ──────────────────────────────────────────────────────────────────────────

  async recruiterDashboard(_req: Request, res: Response) {
    res.json(await portalService.recruiterDashboard());
  },

  async recruiterJobs(req: Request, res: Response) {
    const jobs = await hiringRepository.listAllJobs(req.organizationId);
    res.json(
      jobs.map((j) => ({
        id: j.publicId,
        title: j.title,
        location: j.location,
        team: j.team,
        summary: j.summary,
        requirements: j.requirements,
        isActive: j.isActive
      }))
    );
  },

  async recruiterCreateJob(req: Request, res: Response) {
    const parsed = jobCreateSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, "Invalid request", parsed.error.flatten().fieldErrors);
    res.status(201).json(
      await hiringService.createJob({
        ...parsed.data,
        createdBy: req.user ? String(req.user._id) : undefined,
        organizationId: req.organizationId  // scope the new job to this org
      })
    );
  },

  async recruiterUpdateJob(req: Request, res: Response) {
    res.json(await portalService.updateJob(req.params.id, req.body || {}));
  },

  async recruiterCloseJob(req: Request, res: Response) {
    res.json(await portalService.closeJob(req.params.id));
  },

  async recruiterDeleteJob(req: Request, res: Response) {
    res.json(await portalService.deleteJob(req.params.id));
  },

  async recruiterCandidates(req: Request, res: Response) {
    const candidates = await hiringRepository.listCandidates(req.organizationId);
    res.json(
      candidates.map((c) => ({
        id: c.publicId,
        name: c.name,
        email: c.email,
        status: c.status,
        matchScore: c.matchScore,
        confidence: c.confidence,
        strengths: c.strengths,
        gaps: c.gaps,
        explanation: c.explanation,
        parsedResume: c.parsedResume,
        skills: c.skills
      }))
    );
  },

  async recruiterApplications(req: Request, res: Response) {
    res.json(await hiringRepository.listApplications(req.organizationId));
  },

  async recruiterScreen(req: Request, res: Response) {
    const intent = req.body?.intent || "Screen candidates for senior backend role";
    const result = await hiringService.runCommand(intent);
    const apps = await hiringRepository.listApplications(req.organizationId);
    for (const app of apps) {
      if (app.status === "Applied" || app.status === "Screening") {
        app.status = "Shortlisted";
        await app.save();
      }
    }
    res.json(result);
  },

  async recruiterQuestions(req: Request, res: Response) {
    res.json(await hiringService.questions(req.body?.candidateId));
  },

  async recruiterSchedule(req: Request, res: Response) {
    const candidateId = req.body?.candidateId;
    if (!candidateId) throw new AppError(400, "candidateId required");
    res.status(201).json(
      await portalService.scheduleWithAssignment({
        candidateId,
        interviewerEmail: req.body?.interviewerEmail,
        round: req.body?.round,
        time: req.body?.time,
        command: req.body?.command
      })
    );
  },

  async recruiterFeedback(_req: Request, res: Response) {
    res.json(await hiringRepository.listFeedback());
  },

  async recruiterDecide(req: Request, res: Response) {
    const decision = req.body?.decision;
    const candidateId = req.body?.candidateId;
    if (!candidateId || !["Hire", "Reject", "Hold"].includes(decision)) {
      throw new AppError(400, "candidateId and decision (Hire|Reject|Hold) required");
    }
    res.json(
      await portalService.decide({
        candidateId,
        decision,
        reason: req.body?.reason
      })
    );
  },

  async recruiterSetStatus(req: Request, res: Response) {
    if (!req.body?.applicationId || !req.body?.status) {
      throw new AppError(400, "applicationId and status required");
    }
    res.json(await portalService.setApplicationStatus(req.body.applicationId, req.body.status));
  },

  // ──────────────────────────────────────────────────────────────────────────
  // INTERVIEWER routes
  // ──────────────────────────────────────────────────────────────────────────

  async interviewerAssigned(req: Request, res: Response) {
    if (!req.user) throw new AppError(401, "Authentication required");
    const assigned = await hiringRepository.listInterviewsForInterviewer(
      String(req.user._id),
      req.user.name
    );
    res.json(
      assigned.map((i) => ({
        id: i.publicId,
        candidateId: i.candidateId,
        candidate: i.candidate,
        interviewer: i.interviewer,
        round: i.round,
        time: i.time,
        status: i.status,
        joinLink: i.joinLink
      }))
    );
  },

  async interviewerBrief(req: Request, res: Response) {
    if (!req.user) throw new AppError(401, "Authentication required");
    res.json(
      await portalService.interviewerBrief(req.params.id, String(req.user._id), req.user.name)
    );
  },

  async interviewerFeedback(req: Request, res: Response) {
    if (!req.user) throw new AppError(401, "Authentication required");
    const feedbackText = req.body?.feedbackText;
    if (!feedbackText) throw new AppError(400, "feedbackText required");
    res.json(
      await portalService.submitStructuredFeedback({
        userId: String(req.user._id),
        userName: req.user.name,
        interviewId: req.body?.interviewId,
        feedbackText,
        ratings: req.body?.ratings
      })
    );
  },

  // ──────────────────────────────────────────────────────────────────────────
  // DEVELOPER / CANDIDATE routes — scoped by userId (no org isolation)
  // ──────────────────────────────────────────────────────────────────────────

  async candidateJobs(req: Request, res: Response) {
    res.json(
      await portalService.listJobsForCandidate({
        q: req.query.q as string | undefined,
        location: req.query.location as string | undefined,
        skill: req.query.skill as string | undefined
      })
    );
  },

  async candidateJobById(req: Request, res: Response) {
    const job = await portalService.getJobById(req.params.id);
    res.json(job);
  },

  async candidateApply(req: Request, res: Response) {
    if (!req.user) throw new AppError(401, "Authentication required");
    const resumeText = resumeTextFromReq(req);
    if (!resumeText.trim()) throw new AppError(400, "Please upload a resume file or paste resume text");
    res.status(201).json(
      await portalService.applyToJob(
        { _id: req.user._id, name: req.user.name, email: req.user.email },
        { resumeText, jobId: req.body?.jobId }
      )
    );
  },

  async candidateApplications(req: Request, res: Response) {
    if (!req.user) throw new AppError(401, "Authentication required");
    const portal = await hiringService.candidatePortal(String(req.user._id));
    res.json(portal.applications);
  },

  async candidateSchedule(req: Request, res: Response) {
    if (!req.user) throw new AppError(401, "Authentication required");
    const portal = await hiringService.candidatePortal(String(req.user._id));
    res.json(portal.interviews);
  },

  async candidateOffers(req: Request, res: Response) {
    if (!req.user) throw new AppError(401, "Authentication required");
    const portal = await hiringService.candidatePortal(String(req.user._id));
    res.json(portal.offers);
  },

  async candidatePortal(req: Request, res: Response) {
    if (!req.user) throw new AppError(401, "Authentication required");
    res.json(await hiringService.candidatePortal(String(req.user._id)));
  },

  async candidateProfile(req: Request, res: Response) {
    if (!req.user) throw new AppError(401, "Authentication required");
    res.json(
      await portalService.updateCandidateProfile(String(req.user._id), {
        name: req.body?.name,
        firstName: req.body?.firstName,
        lastName: req.body?.lastName,
        whoami: req.body?.whoami || req.body?.tagline,
        tagline: req.body?.tagline || req.body?.whoami,
        bio: req.body?.bio || req.body?.describeMe,
        describeMe: req.body?.describeMe || req.body?.bio,
        location: req.body?.location,
        skills: req.body?.skills,
        experience: req.body?.experience,
        education: req.body?.education,
        certifications: req.body?.certifications
      })
    );
  },

  async candidateOfferRespond(req: Request, res: Response) {
    if (!req.user) throw new AppError(401, "Authentication required");
    const decision = req.body?.decision;
    if (!["Accepted", "Rejected"].includes(decision)) {
      throw new AppError(400, "decision must be Accepted or Rejected");
    }
    res.json(await portalService.respondToOffer(String(req.user._id), req.params.id, decision));
  },

  async candidateReschedule(req: Request, res: Response) {
    if (!req.user) throw new AppError(401, "Authentication required");
    res.json(
      await portalService.requestReschedule(
        String(req.user._id),
        req.params.id,
        req.body?.note || ""
      )
    );
  }
};
