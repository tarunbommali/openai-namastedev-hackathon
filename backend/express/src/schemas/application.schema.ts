import { z } from "zod";

export const APPLICATION_STATUSES = [
  "Applied",
  "Screening",
  "Shortlisted",
  "Interview Scheduled",
  "Under Review",
  "Selected",
  "Rejected"
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const humanOverrideSchema = z.object({
  isOverridden: z.boolean().default(false),
  originalVerdict: z.string().default(""),
  originalScore: z.number().default(0),
  newVerdict: z.string().default(""),
  newScore: z.number().default(0),
  editedBy: z.string().default(""),
  reason: z.string().default(""),
  timestamp: z.date().optional()
});

export const applicationSchema = z.object({
  id: z.string().optional(),
  publicId: z.string(),
  candidateId: z.string(),
  jobId: z.string(),
  organizationId: z.string().optional(),
  status: z.enum(APPLICATION_STATUSES).default("Applied"),
  matchScore: z.number().default(0),
  resumeScore: z.number().default(0),
  notes: z.string().default(""),
  humanOverride: humanOverrideSchema.optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type ApplicationEntity = z.infer<typeof applicationSchema>;
