import { z } from "zod";

export const textBodySchema = z.object({
  intent: z.string().trim().min(3).max(2000).optional(),
  resumeText: z.string().trim().min(10).max(50000).optional(),
  command: z.string().trim().min(3).max(2000).optional(),
  feedbackText: z.string().trim().min(3).max(10000).optional(),
  candidateId: z.string().trim().min(1).optional(),
  interviewId: z.string().trim().min(1).optional()
});

export const jobCreateSchema = z.object({
  title: z.string().min(3),
  location: z.string().optional(),
  team: z.string().optional(),
  summary: z.string().optional(),
  requirements: z.array(z.string()).optional()
});
