import { z } from "zod";

export const SCREENING_JOB_STATUSES = ["queued", "processing", "completed", "failed"] as const;

export const screeningJobSchema = z.object({
  id: z.string().optional(),
  publicId: z.string(),
  tenantId: z.string().default("default-tenant"),
  jobId: z.string(),
  candidateIds: z.array(z.string()).default([]),
  status: z.enum(SCREENING_JOB_STATUSES).default("queued"),
  progress: z.number().default(0),
  processedCount: z.number().default(0),
  totalCount: z.number().default(0),
  results: z.array(z.object({
    candidateId: z.string(),
    score: z.number(),
    verdict: z.string(),
    error: z.string().optional()
  })).default([]),
  error: z.string().default(""),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type ScreeningJobEntity = z.infer<typeof screeningJobSchema>;
