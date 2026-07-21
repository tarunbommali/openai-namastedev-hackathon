import { z } from "zod";

export const scoringWeightsSchema = z.object({
  skillMatch: z.number().default(50),
  experienceMatch: z.number().default(30),
  seniorityMatch: z.number().default(20)
});

/**
 * Job Schema
 * – Created by company_admin or recruiter (both within the same org)
 * – organizationId scopes the job to a company
 * – createdBy tracks which user (company_admin or recruiter) posted it
 * – Visible in: Company Portal → Job Management, Recruiter Portal → Jobs & Weighting
 * – Candidates apply via /api/candidate/apply → linked by jobId
 */
export const jobSchema = z.object({
  id: z.string().optional(),
  publicId: z.string(),
  title: z.string(),
  location: z.string().default(""),
  team: z.string().default(""),
  department: z.string().optional(),            // department e.g. "Engineering", "Product"
  employmentType: z.enum(["Full-time", "Part-time", "Contract", "Internship"]).default("Full-time"),
  salaryRange: z.string().optional(),           // e.g. "₹18L – ₹28L per annum"
  summary: z.string().default(""),
  requirements: z.array(z.string()).default([]),
  scoringWeights: scoringWeightsSchema.optional(),
  createdBy: z.string().optional(),             // User._id of company_admin or recruiter
  assignedRecruiterId: z.string().optional(),   // Recruiter responsible for screening
  organizationId: z.string().optional(),        // Company that owns this job
  isActive: z.boolean().default(true),
  closedAt: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type JobEntity = z.infer<typeof jobSchema>;
