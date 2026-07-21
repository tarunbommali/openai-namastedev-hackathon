import { Application } from "../models/Application";
import { Interview } from "../models/Interview";
import { Job } from "../models/Job";
import { Offer } from "../models/Offer";
import { User } from "../models/User";
import { hiringRepository } from "../repositories/hiringRepository";
import { AppError } from "../utils/errors";
import { hiringService } from "./hiringService";

export const portalService = {
  async listJobsForCandidate(query: { q?: string; location?: string; skill?: string }) {
    const jobs = await hiringRepository.listJobs();
    return jobs
      .filter((job) => {
        const hay = `${job.title} ${job.summary} ${job.location} ${(job.requirements || []).join(" ")}`.toLowerCase();
        if (query.q && !hay.includes(query.q.toLowerCase())) return false;
        if (query.location && !job.location.toLowerCase().includes(query.location.toLowerCase())) return false;
        if (query.skill && !hay.includes(query.skill.toLowerCase())) return false;
        return true;
      })
      .map((job) => ({
        id: job.publicId,
        title: job.title,
        location: job.location,
        team: job.team,
        summary: job.summary,
        requirements: job.requirements
      }));
  },

  async getJobById(publicId: string) {
    const job = await Job.findOne({ publicId });
    if (!job) throw new AppError(404, "Job not found");
    return {
      id: job.publicId,
      title: job.title,
      location: job.location,
      team: job.team,
      summary: job.summary,
      requirements: job.requirements,
      isActive: job.isActive
    };
  },

  async applyToJob(
    user: { _id: unknown; name: string; email: string },
    input: { resumeText: string; jobId?: string }
  ) {
    let jobId = input.jobId;
    if (jobId) {
      const job = await Job.findOne({ publicId: jobId, isActive: true });
      if (!job) throw new AppError(404, "Job not found or closed");
    } else {
      const primary = await hiringRepository.getPrimaryJob();
      jobId = primary?.publicId;
    }

    const existingCandidate = await hiringRepository.findCandidateByUserId(String(user._id));
    if (existingCandidate && jobId) {
      const existing = await Application.findOne({
        candidateId: existingCandidate.publicId,
        jobId
      });
      if (existing && existing.status !== "Rejected") {
        throw new AppError(409, "You already applied to this job");
      }
    }

    const result = await hiringService.applyAsCandidate(user, input.resumeText);
    if (result.application) {
      await Application.findOneAndUpdate(
        { publicId: result.application.id },
        {
          $set: {
            jobId: jobId || result.application.jobId,
            status: "Screening",
            resumeScore: result.application.matchScore
          }
        }
      );
      result.application.jobId = jobId || result.application.jobId;
      result.application.status = "Screening";
    }

    const candidate = await hiringRepository.findCandidateByUserId(String(user._id));
    if (candidate) {
      const versions = candidate.resumeVersions || [];
      versions.unshift({
        at: new Date().toISOString(),
        preview: input.resumeText.slice(0, 180)
      });
      await hiringRepository.upsertCandidate(candidate.publicId, {
        resumeVersions: versions.slice(0, 10),
        skills: (result.parsedResume as { skills?: string[] })?.skills || candidate.skills
      } as never);
    }

    return {
      ...result,
      resumeScore: result.application.matchScore,
      message: "Resume analyzed and application moved to Screening"
    };
  },

  async updateCandidateProfile(
    userId: string,
    patch: {
      name?: string;
      firstName?: string;
      lastName?: string;
      whoami?: string;
      tagline?: string;
      bio?: string;
      describeMe?: string;
      location?: string;
      skills?: string[];
      experience?: string;
      education?: string;
      certifications?: string[];
    }
  ) {
    const candidate = await hiringRepository.findCandidateByUserId(userId);
    if (!candidate) throw new AppError(404, "Candidate profile not found");
    if (patch.name) await User.findByIdAndUpdate(userId, { name: patch.name });
    const updated = await hiringRepository.upsertCandidate(candidate.publicId, {
      name: patch.name || candidate.name,
      firstName: patch.firstName,
      lastName: patch.lastName,
      whoami: patch.whoami || patch.tagline,
      tagline: patch.tagline || patch.whoami,
      bio: patch.bio || patch.describeMe,
      describeMe: patch.describeMe || patch.bio,
      location: patch.location ?? candidate.location,
      skills: patch.skills ?? candidate.skills,
      experience: patch.experience ?? candidate.experience,
      education: patch.education ?? candidate.education,
      certifications: patch.certifications ?? candidate.certifications
    } as never);
    return updated;
  },

  async respondToOffer(userId: string, offerId: string, decision: "Accepted" | "Rejected") {
    const candidate = await hiringRepository.findCandidateByUserId(userId);
    if (!candidate) throw new AppError(404, "Candidate not found");
    const offer = await Offer.findOne({ publicId: offerId, candidateId: candidate.publicId });
    if (!offer) throw new AppError(404, "Offer not found");
    if (offer.status !== "Sent" && offer.status !== "Drafted") {
      throw new AppError(400, `Offer already ${offer.status}`);
    }
    // Only recruiter-sent offers can be accepted; Drafted is internal until decide() marks Sent
    if (decision === "Accepted" && offer.status !== "Sent") {
      throw new AppError(400, "Offer is not yet sent by recruiter");
    }
    offer.status = decision;
    await offer.save();
    if (decision === "Accepted" && offer.jobId) {
      await Application.updateMany(
        { candidateId: candidate.publicId, jobId: offer.jobId },
        { $set: { status: "Selected" } }
      );
    } else if (decision === "Accepted") {
      await Application.updateMany(
        { candidateId: candidate.publicId },
        { $set: { status: "Selected" } }
      );
    }
    return offer;
  },

  async requestReschedule(userId: string, interviewId: string, note: string) {
    const candidate = await hiringRepository.findCandidateByUserId(userId);
    if (!candidate) throw new AppError(404, "Candidate not found");
    const interview = await Interview.findOne({
      publicId: interviewId,
      candidateId: candidate.publicId
    });
    if (!interview) throw new AppError(404, "Interview not found");
    interview.rescheduleRequested = true;
    interview.rescheduleNote = note || "Candidate requested a new time";
    interview.status = "Reschedule Requested";
    await interview.save();
    return interview;
  },

  async recruiterDashboard() {
    const [jobs, candidates, interviews, applications, logs] = await Promise.all([
      hiringRepository.listJobs(),
      hiringRepository.listCandidates(),
      hiringRepository.listInterviews(),
      hiringRepository.listApplications(),
      hiringRepository.listExecutionLogs({ limit: 8 })
    ]);
    const today = new Date().toDateString();
    const interviewsToday = interviews.filter((i) => {
      const created = (i as { createdAt?: Date }).createdAt;
      return created ? new Date(created).toDateString() === today : false;
    }).length;
    return {
      openJobs: jobs.length,
      totalCandidates: candidates.length,
      interviewsToday,
      applications: applications.length,
      aiActivity: logs.map((l) => ({
        executionId: l.executionId,
        status: l.status,
        agents: (l.traces || []).slice(0, 3).map((t) => t.agent),
        createdAt: (l as { createdAt?: Date }).createdAt
      }))
    };
  },

  async updateJob(publicId: string, patch: Record<string, unknown>) {
    const job = await Job.findOneAndUpdate({ publicId }, { $set: patch }, { new: true });
    if (!job) throw new AppError(404, "Job not found");
    return {
      id: job.publicId,
      title: job.title,
      location: job.location,
      team: job.team,
      summary: job.summary,
      requirements: job.requirements,
      isActive: job.isActive
    };
  },

  async closeJob(publicId: string) {
    return this.updateJob(publicId, { isActive: false });
  },

  async deleteJob(publicId: string) {
    const job = await Job.findOneAndDelete({ publicId });
    if (!job) throw new AppError(404, "Job not found");
    return { ok: true, id: publicId };
  },

  async setApplicationStatus(applicationId: string, status: string) {
    const app = await Application.findOneAndUpdate(
      { publicId: applicationId },
      { $set: { status } },
      { new: true }
    );
    if (!app) throw new AppError(404, "Application not found");
    return app;
  },

  async scheduleWithAssignment(input: {
    candidateId: string;
    interviewerEmail?: string;
    round?: string;
    time?: string;
    command?: string;
  }) {
    const candidate = await hiringRepository.findCandidate(input.candidateId);
    if (!candidate) throw new AppError(404, "Candidate not found");

    const interviewerUser = input.interviewerEmail
      ? await User.findOne({ email: input.interviewerEmail.toLowerCase(), role: "interviewer" })
      : await User.findOne({ role: "interviewer" });
    if (!interviewerUser) {
      throw new AppError(404, "Interviewer not found — use interviewer@hireflow.ai");
    }

    const time = input.time || "Wednesday 2:30 PM";
    const round = input.round || "Technical Round 1";
    const publicId = `iv-${Date.now()}`;
    const primaryJob = await hiringRepository.getPrimaryJob();
    const interview = await Interview.create({
      publicId,
      candidateId: candidate.publicId,
      candidate: candidate.name,
      interviewer: interviewerUser.name,
      interviewerUserId: interviewerUser._id,
      jobId: primaryJob?.publicId || "",
      round,
      time,
      status: "Scheduled",
      joinLink: `https://meet.hireflow.local/i/${publicId}`
    });

    await Application.updateMany(
      { candidateId: candidate.publicId, ...(primaryJob ? { jobId: primaryJob.publicId } : {}) },
      { $set: { status: "Interview Scheduled" } }
    );

    return {
      interview: {
        id: interview.publicId,
        candidateId: interview.candidateId,
        candidate: interview.candidate,
        interviewer: interview.interviewer,
        round: interview.round,
        time: interview.time,
        status: interview.status,
        joinLink: interview.joinLink
      },
      message: "Interview scheduled and interviewer assigned"
    };
  },

  async decide(input: {
    candidateId: string;
    decision: "Hire" | "Reject" | "Hold";
    reason?: string;
  }) {
    const candidate = await hiringRepository.findCandidate(input.candidateId);
    if (!candidate) throw new AppError(404, "Candidate not found");

    const status =
      input.decision === "Hire" ? "Selected" : input.decision === "Reject" ? "Rejected" : "Under Review";
    await Application.updateMany({ candidateId: candidate.publicId }, { $set: { status } });

    let offer = null;
    if (input.decision === "Hire") {
      const job = await hiringRepository.getPrimaryJob();
      offer = await hiringRepository.createOffer({
        publicId: `off-${Date.now()}`,
        candidateId: candidate.publicId,
        candidate: candidate.name,
        jobId: job?.publicId || "",
        subject: `Offer — ${job?.title || "Role"}`,
        body: `Hi ${candidate.name},\n\nWe are pleased to offer you the ${job?.title || "role"}.\n\nPlease accept or reject in your HireFlow portal.\n\n— HireFlow Recruiting`,
        status: "Sent"
      });
    }

    return {
      decision: input.decision,
      status,
      reason: input.reason || `Marked as ${input.decision}`,
      offer: offer
        ? {
            id: offer.publicId,
            subject: offer.subject,
            status: offer.status
          }
        : null
    };
  },

  async interviewerBrief(interviewId: string, userId: string, userName: string) {
    const interviews = await hiringRepository.listInterviewsForInterviewer(userId, userName);
    const interview = interviews.find((i) => i.publicId === interviewId) || interviews[0];
    if (!interview) throw new AppError(404, "Interview not found");
    const candidate = await hiringRepository.findCandidate(interview.candidateId);
    const job = await hiringRepository.getPrimaryJob();
    return {
      interview: {
        id: interview.publicId,
        candidate: interview.candidate,
        round: interview.round,
        time: interview.time,
        status: interview.status,
        joinLink: interview.joinLink
      },
      job: job
        ? {
            id: job.publicId,
            title: job.title,
            summary: job.summary,
            requirements: job.requirements
          }
        : null,
      candidate: candidate
        ? {
            id: candidate.publicId,
            name: candidate.name,
            resume: candidate.parsedResume,
            resumeText: candidate.resumeText?.slice(0, 2000),
            strengths: candidate.strengths,
            weaknesses: candidate.gaps,
            matchScore: candidate.matchScore,
            explanation: candidate.explanation,
            aiSummary:
              candidate.explanation ||
              `${candidate.name} shows ${candidate.strengths?.slice(0, 3).join(", ") || "relevant"} strengths.`
          }
        : { name: interview.candidate }
    };
  },

  async submitStructuredFeedback(input: {
    userId: string;
    userName: string;
    interviewId?: string;
    feedbackText: string;
    ratings?: {
      technical: number;
      communication: number;
      problemSolving: number;
      cultureFit: number;
    };
  }) {
    if (input.interviewId) {
      const owned = await hiringRepository.listInterviewsForInterviewer(input.userId, input.userName);
      if (!owned.find((i) => i.publicId === input.interviewId)) {
        throw new AppError(403, "Interview not assigned to you");
      }
    }
    const result = await hiringService.submitFeedback(input.feedbackText, input.interviewId);
    const { Feedback } = await import("../models/Feedback");
    await Feedback.findOneAndUpdate(
      { publicId: result.id },
      {
        $set: {
          ratings: input.ratings || {},
          submittedBy: input.userId,
          aiSummary: result.recommendation?.reason || result.analysis?.summary || ""
        }
      }
    );
    if (input.interviewId) {
      await Interview.findOneAndUpdate(
        { publicId: input.interviewId },
        { $set: { status: "Completed" } }
      );
      const interview = await Interview.findOne({ publicId: input.interviewId });
      if (interview?.candidateId) {
        await Application.updateMany(
          { candidateId: interview.candidateId },
          { $set: { status: "Under Review" } }
        );
      }
    }
    return {
      ...result,
      ratings: input.ratings,
      aiSummary: result.recommendation?.reason
    };
  }
};
