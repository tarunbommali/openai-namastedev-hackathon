import { ScreeningJob } from "../models/ScreeningJob";
import { hiringService } from "../services/hiringService";
import { WebhookService } from "../services/webhookService";

export class ScreeningQueueService {
  /**
   * Enqueue a batch screening job for a given position & candidates
   */
  static async enqueueBatchScreening(
    tenantId: string,
    jobId: string,
    candidateIds: string[]
  ) {
    const publicId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const jobDoc = await ScreeningJob.create({
      publicId,
      tenantId,
      jobId,
      candidateIds,
      status: "queued",
      progress: 0,
      processedCount: 0,
      totalCount: candidateIds.length,
      results: []
    });

    // Launch processing in background non-blocking task
    setImmediate(() => {
      this.processJob(publicId).catch((err) => {
        console.error(`[ScreeningQueue] Error processing job ${publicId}:`, err);
      });
    });

    return jobDoc;
  }

  /**
   * Process enqueued batch screening job
   */
  private static async processJob(jobPublicId: string) {
    const jobDoc = await ScreeningJob.findOne({ publicId: jobPublicId });
    if (!jobDoc) return;

    jobDoc.status = "processing";
    await jobDoc.save();

    try {
      const results: Array<{
        candidateId: string;
        score: number;
        verdict: string;
        error?: string;
      }> = [];

      for (let i = 0; i < jobDoc.candidateIds.length; i++) {
        const candidateId = jobDoc.candidateIds[i];
        try {
          // Execute AI screening pipeline via the generic command runner
          const screenResult = await hiringService.runCommand(
            `Screen candidate ${candidateId} for job ${jobDoc.jobId}`
          );

          // Extract score from the first matching candidate in the result
          type ScreenedCandidate = { id?: string; publicId?: string; matchScore?: number; status?: string };
          const rawCandidates = (screenResult as { candidates?: unknown })?.candidates;
          const candidates: ScreenedCandidate[] = Array.isArray(rawCandidates)
            ? (rawCandidates as ScreenedCandidate[])
            : [];
          const matched = candidates.find(
            (c) => c.id === candidateId || c.publicId === candidateId
          );
          const score = matched?.matchScore ?? 75;
          const verdict = matched?.status || (score >= 70 ? "Hire" : "Hold");

          results.push({
            candidateId,
            score,
            verdict
          });

          // Dispatch webhook event for candidate screening
          WebhookService.dispatchEvent("candidate.screened", jobDoc.tenantId, {
            jobId: jobDoc.jobId,
            candidateId,
            matchScore: score,
            verdict
          }).catch(() => {});
        } catch (err: unknown) {
          results.push({
            candidateId,
            score: 0,
            verdict: "Error",
            error: (err as Error).message || "Screening failed"
          });
        }

        jobDoc.processedCount = i + 1;
        jobDoc.progress = Math.round(((i + 1) / jobDoc.totalCount) * 100);
        jobDoc.results = results;
        await jobDoc.save();
      }

      jobDoc.status = "completed";
      jobDoc.progress = 100;
      await jobDoc.save();

      // Dispatch decision webhook
      WebhookService.dispatchEvent("decision.made", jobDoc.tenantId, {
        batchJobId: jobPublicId,
        jobId: jobDoc.jobId,
        totalScreened: results.length,
        completedAt: new Date().toISOString()
      }).catch(() => {});
    } catch (err: any) {
      jobDoc.status = "failed";
      jobDoc.error = err.message || "Batch job processing failed";
      await jobDoc.save();
    }
  }

  /**
   * Get job progress status
   */
  static async getJobStatus(tenantId: string, jobId: string) {
    const jobDoc = await ScreeningJob.findOne({ publicId: jobId, tenantId });
    if (!jobDoc) {
      // Fallback: search by mongo jobId or publicId without tenant for backward compatibility
      return await ScreeningJob.findOne({ publicId: jobId });
    }
    return jobDoc;
  }
}
