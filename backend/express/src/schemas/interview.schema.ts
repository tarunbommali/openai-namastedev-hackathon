import { z } from "zod";

export const interviewSchema = z.object({
  id: z.string().optional(),
  publicId: z.string(),
  candidateId: z.string().default(""),
  candidate: z.string(),
  interviewer: z.string(),
  interviewerUserId: z.string().optional(),
  jobId: z.string().default(""),
  round: z.string().default("Technical Round 1"),
  time: z.string(),
  status: z.string().default("Scheduled"),
  joinLink: z.string().default(""),
  rescheduleRequested: z.boolean().default(false),
  rescheduleNote: z.string().default(""),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type InterviewEntity = z.infer<typeof interviewSchema>;
