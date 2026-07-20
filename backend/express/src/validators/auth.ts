import { z } from "zod";

/**
 * Company-side registration — creates Organization + Company Admin.
 * Used by POST /api/auth/register/company
 */
export const registerCompanySchema = z.object({
  companyName: z.string().trim().min(2).max(200),
  email: z.string().email(),
  domain: z.string().trim().optional(),
  industry: z.string().min(1),
  size: z.string().min(1),
  country: z.string().min(1),
  password: z.string().min(8).max(128)
});

/**
 * Developer (candidate) self-registration.
 * Used by POST /api/auth/register/developer
 */
export const registerDeveloperSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

/**
 * Legacy register schema — accepts only developer/candidate role.
 * Used by POST /api/auth/register (backward-compat)
 */
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(2).max(120).optional(),
  role: z.enum(["developer", "candidate"]).default("developer")
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10)
});
