import { Request, Response } from "express";
import { hiringService } from "../services/hiringService";
import { textBodySchema } from "../validators/hiring";
import { AppError } from "../utils/errors";

function parseBody(req: Request) {
  const parsed = textBodySchema.safeParse(req.body || {});
  if (!parsed.success) throw new AppError(400, "Invalid request", parsed.error.flatten().fieldErrors);
  return parsed.data;
}

export const compatController = {
  async health(_req: Request, res: Response) {
    let ai: { ok: boolean; detail?: string } = { ok: false };
    try {
      const { aiServiceClient } = await import("../clients/aiServiceClient");
      const data = await aiServiceClient.health();
      ai = { ok: Boolean(data?.ok), detail: data?.service };
    } catch (error) {
      ai = { ok: false, detail: (error as Error).message };
    }
    res.json({ ok: true, app: "HireFlow AI", ai });
  },
  async agentLogs(_req: Request, res: Response) {
    res.json(await hiringService.agentLogs());
  },
  async command(req: Request, res: Response) {
    const body = parseBody(req);
    const intent =
      body.intent ||
      "Hire a senior backend engineer with Node.js, Kafka, Redis, and distributed systems experience.";
    const idempotencyKey = (req.headers["x-idempotency-key"] as string) || (req.body && req.body.idempotencyKey);
    res.json(await hiringService.runCommand(intent, idempotencyKey));
  },
  async resumes(req: Request, res: Response) {
    const body = parseBody(req);
    const fromFile = req.file?.buffer?.toString("utf8");
    const resumeText =
      body.resumeText ||
      fromFile ||
      "John Doe senior backend engineer Node.js Kafka Redis Docker AWS 6 years";
    res.json(await hiringService.parseResume(resumeText));
  },
  async questions(req: Request, res: Response) {
    const body = parseBody(req);
    res.json(await hiringService.questions(body.candidateId));
  },
  async interviewPreview(req: Request, res: Response) {
    const body = parseBody(req);
    const command =
      body.command ||
      "Schedule a 45-minute technical interview next week with available backend interviewers.";
    res.json(await hiringService.schedulePreview(command));
  },
  async interviewSchedule(req: Request, res: Response) {
    const body = parseBody(req);
    const command =
      body.command ||
      "Schedule a 45-minute technical interview next week with available backend interviewers.";
    res.json(await hiringService.scheduleConfirm(command));
  },
  async interviews(_req: Request, res: Response) {
    const overview = await hiringService.getOverview();
    res.json(overview.interviews);
  },
  async feedback(req: Request, res: Response) {
    const body = parseBody(req);
    const feedbackText =
      body.feedbackText ||
      "Strong backend fundamentals, excellent system design understanding, strong communication.";
    res.json(await hiringService.submitFeedback(feedbackText, body.interviewId));
  },
  async jobs(_req: Request, res: Response) {
    res.json(await hiringService.listJobs());
  },
  async applications(_req: Request, res: Response) {
    const overview = await hiringService.getOverview();
    res.json(overview.candidates);
  },


  // ---- SaaS Integration & Async Queue Endpoints ----
  async importCandidatesCsv(req: Request, res: Response) {
    const { CsvService } = await import("../services/csvService");
    const { Candidate } = await import("../models/Candidate");
    const csvContent = req.file?.buffer?.toString("utf8") || req.body?.csvContent || "";
    const parsed = CsvService.parseCandidateCsv(csvContent);

    const imported = [];
    for (const item of parsed) {
      const publicId = `cand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const doc = await Candidate.create({
        publicId,
        name: item.name,
        email: item.email,
        phone: item.phone || "",
        skills: item.skills ? item.skills.split(";").map((s) => s.trim()) : [],
        experienceYears: Number(item.experienceYears) || 2,
        resumeText: item.resumeText || ""
      });
      imported.push(doc);
    }

    res.json({ ok: true, count: imported.length, candidates: imported });
  },

  async importJobsCsv(req: Request, res: Response) {
    const { CsvService } = await import("../services/csvService");
    const { Job } = await import("../models/Job");
    const csvContent = req.file?.buffer?.toString("utf8") || req.body?.csvContent || "";
    const parsed = CsvService.parseJobCsv(csvContent);

    const imported = [];
    for (const item of parsed) {
      const publicId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const doc = await Job.create({
        publicId,
        title: item.title,
        location: item.location || "Remote",
        team: item.team || "Engineering",
        summary: item.summary || "",
        requirements: item.requirements ? item.requirements.split(";").map((s) => s.trim()) : []
      });
      imported.push(doc);
    }

    res.json({ ok: true, count: imported.length, jobs: imported });
  },

  async exportScreeningCsv(req: Request, res: Response) {
    const { CsvService } = await import("../services/csvService");
    const { Application } = await import("../models/Application");

    const jobId = (req.params.jobId || req.query.jobId) as string;
    const filter = jobId ? { jobId } : {};
    const apps = await Application.find(filter).populate("candidateId jobId").exec();

    const exportData = apps.map((app: any) => ({
      candidateName: app.candidateId?.name || "Candidate",
      email: app.candidateId?.email || "",
      jobTitle: app.jobId?.title || "Job",
      matchScore: app.matchScore || 0,
      verdict: app.status || "Ranked",
      appliedDate: app.createdAt ? app.createdAt.toISOString() : new Date().toISOString(),
      strengths: app.strengths || [],
      skillGaps: app.gaps || [],
      humanOverrideVerdict: app.humanOverride?.isOverridden ? app.humanOverride.newVerdict : undefined
    }));

    const csvOutput = CsvService.generateScreeningExportCsv(exportData);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=screening_results_${jobId || "all"}.csv`);
    res.send(csvOutput);
  },

  async registerWebhook(req: Request, res: Response) {
    const { WebhookService } = await import("../services/webhookService");
    const tenantId = (req as any).tenantId || "default-tenant";
    const { url, events, secret } = req.body || {};
    if (!url) throw new AppError(400, "Webhook URL is required");

    const subscription = await WebhookService.registerWebhook(tenantId, url, events || ["candidate.screened"], secret);
    res.json({ ok: true, subscription });
  },

  async listWebhooks(req: Request, res: Response) {
    const { WebhookSubscription } = await import("../models/WebhookSubscription");
    const tenantId = (req as any).tenantId || "default-tenant";
    const subscriptions = await WebhookSubscription.find({ tenantId, isActive: true });
    res.json({ ok: true, subscriptions });
  },

  async batchScreenAsync(req: Request, res: Response) {
    const { ScreeningQueueService } = await import("../queues/screeningQueue");
    const tenantId = (req as any).tenantId || "default-tenant";
    const { jobId, candidateIds } = req.body || {};

    if (!jobId || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      throw new AppError(400, "jobId and array of candidateIds are required");
    }

    const job = await ScreeningQueueService.enqueueBatchScreening(tenantId, jobId, candidateIds);
    res.json({ ok: true, jobId: job.publicId, status: job.status, totalCount: job.totalCount });
  },

  async getScreeningJobStatus(req: Request, res: Response) {
    const { ScreeningQueueService } = await import("../queues/screeningQueue");
    const tenantId = (req as any).tenantId || "default-tenant";
    const { jobId } = req.params;

    const job = await ScreeningQueueService.getJobStatus(tenantId, jobId);
    if (!job) throw new AppError(404, "Screening job not found");

    res.json({ ok: true, job });
  },

  async getAuditLogs(req: Request, res: Response) {
    const { AuditLog } = await import("../models/AuditLog");
    const tenantId = (req as any).tenantId || "default-tenant";
    const logs = await AuditLog.find({ tenantId }).sort({ createdAt: -1 }).limit(100);
    res.json({ ok: true, count: logs.length, logs });
  },

  async getBiasAuditReport(req: Request, res: Response) {
    const { AuditService } = await import("../services/auditService");
    const tenantId = (req as any).tenantId || "default-tenant";
    const report = await AuditService.generateBiasAuditReport(tenantId);
    res.json({ ok: true, report });
  },

  async updateTenantBaseline(req: Request, res: Response) {
    const { Tenant } = await import("../models/Tenant");
    const tenantId = (req as any).tenantId || "default-tenant";
    const { manualHoursPerBatch, recruiterHourlyRateUSD, manualCostPerCandidateUSD } = req.body || {};

    const tenant = await Tenant.findOneAndUpdate(
      { publicId: tenantId },
      {
        $set: {
          baselineSettings: {
            manualHoursPerBatch: Number(manualHoursPerBatch) || 16,
            recruiterHourlyRateUSD: Number(recruiterHourlyRateUSD) || 35,
            manualCostPerCandidateUSD: Number(manualCostPerCandidateUSD) || 12
          }
        }
      },
      { new: true, upsert: true }
    );

    res.json({ ok: true, tenant });
  },

  async getExecutiveRoiReport(req: Request, res: Response) {
    const { Tenant } = await import("../models/Tenant");
    const { TenantUsage } = await import("../models/TenantUsage");
    const tenantId = (req as any).tenantId || "default-tenant";

    const tenant = await Tenant.findOne({ publicId: tenantId });
    const baseline = tenant?.baselineSettings || {
      manualHoursPerBatch: 16,
      recruiterHourlyRateUSD: 35,
      manualCostPerCandidateUSD: 12
    };

    const usage = await TenantUsage.findOne({ tenantId });
    const resumesProcessed = usage?.resumesProcessed || 120;

    const manualTimeHours = (resumesProcessed / 10) * baseline.manualHoursPerBatch;
    const aiTimeHours = (resumesProcessed / 10) * 0.5; // AI takes ~30 mins per batch
    const hoursSaved = Math.max(0, Math.round(manualTimeHours - aiTimeHours));
    const dollarsSaved = Math.round(hoursSaved * baseline.recruiterHourlyRateUSD);

    res.json({
      ok: true,
      report: {
        tenantId,
        baselineSettings: baseline,
        resumesProcessed,
        hoursSaved,
        dollarsSaved,
        timeToShortlistHoursAI: 3.4,
        timeToShortlistHoursManual: 16.0,
        roiPercentage: dollarsSaved > 0 ? Math.round((dollarsSaved / 149) * 100) : 320
      }
    });
  }
};


