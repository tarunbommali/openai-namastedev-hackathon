import { z } from "zod";

export const parsedResumeSchema = z.object({
  name: z.string(),
  skills: z.array(z.string()),
  experienceYears: z.number(),
  seniority: z.string(),
  domain: z.string(),
  education: z.string(),
  achievements: z.array(z.string()),
  roleSignals: z.array(z.string()),
  relevantProjects: z.array(z.string()),
  technologies: z.array(z.string()).optional(),
  leadership: z.array(z.string()).optional()
});

/**
 * Candidate Schema
 * – Used by candidates (self-registered) and sourced candidates (via recruiter)
 * – firstName/lastName/whoami synced from User when userId is present
 * – Visible in Company Portal → Candidate Pipeline
 * – Visible in Recruiter Portal → Screening Results & Decisions
 * – Visible in Interviewer Portal → Interview Brief
 */
export const candidateSchema = z.object({
  id: z.string().optional(),
  publicId: z.string(),
  userId: z.string().optional(),                // linked User account (if self-registered)
  organizationId: z.string().optional(),        // org that sourced/owns this pipeline entry
  name: z.string(),
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  email: z.string().default(""),
  whoami: z.string().max(30).optional(),        // role tagline (≤ 20 chars enforced in UI)
  bio: z.string().optional(),                   // "Describe Me" textarea
  describeMe: z.string().optional(),            // alias for bio
  status: z.string().default("Ranked"),
  resumeText: z.string().default(""),
  parsedResume: parsedResumeSchema.optional(),
  matchScore: z.number().default(0),
  confidence: z.number().default(0),
  explanation: z.string().default(""),
  strengths: z.array(z.string()).default([]),
  gaps: z.array(z.string()).default([]),
  location: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  resumeVersions: z.array(z.object({ at: z.string(), preview: z.string() })).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type CandidateEntity = z.infer<typeof candidateSchema>;
export type ParsedResumeEntity = z.infer<typeof parsedResumeSchema>;
