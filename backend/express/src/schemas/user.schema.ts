import { z } from "zod";

export const USER_ROLES = [
  "company_admin",
  "recruiter",
  "interviewer",
  "candidate",
  "admin",
  "developer"   // alias for candidate (backward compat)
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const userSchema = z.object({
  id: z.string().optional(),
  email: z.string().trim().toLowerCase().email(),
  passwordHash: z.string(),
  name: z.string().trim(),
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  whoami: z.string().max(30).optional(),      // short tagline shown under name in sidebar
  tagline: z.string().max(30).optional(),     // alias for whoami
  role: z.enum(USER_ROLES),
  organizationId: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  tokenVersion: z.number().default(0),
  mustChangePassword: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type UserEntity = z.infer<typeof userSchema>;
