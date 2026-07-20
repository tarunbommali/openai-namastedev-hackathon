import { Request, Response } from "express";
import { authService } from "../services/authService";
import { AppError } from "../utils/errors";
import { z } from "zod";

// ─── Validators ──────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const registerDeveloperSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8)
});

const registerCompanySchema = z.object({
  companyName: z.string().trim().min(2).max(200),
  email: z.string().email(),
  domain: z.string().trim().optional(),
  industry: z.string().min(1),
  size: z.string().min(1),
  country: z.string().min(1),
  password: z.string().min(8)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

// ─── Controller ──────────────────────────────────────────────────────────────

export const authController = {

  /** POST /auth/register/company — creates org + company_admin */
  async registerCompany(req: Request, res: Response) {
    const parsed = registerCompanySchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, "Invalid request", parsed.error.flatten().fieldErrors);
    const result = await authService.registerCompany(parsed.data);
    res.status(201).json(result);
  },

  /** POST /auth/register/developer — creates developer user */
  async registerDeveloper(req: Request, res: Response) {
    const parsed = registerDeveloperSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, "Invalid request", parsed.error.flatten().fieldErrors);
    const result = await authService.registerDeveloper(parsed.data);
    res.status(201).json(result);
  },

  /** POST /auth/register — legacy endpoint (developer-only) */
  async register(req: Request, res: Response) {
    const parsed = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().trim().min(2).max(120).optional(),
      role: z.string().optional()
    }).safeParse(req.body);
    if (!parsed.success) throw new AppError(400, "Invalid request", parsed.error.flatten().fieldErrors);
    const { email, password, name, role } = parsed.data;
    // Legacy: only developer/candidate self-registration allowed
    if (role && !["developer", "candidate"].includes(role)) {
      throw new AppError(403, "Company accounts must use POST /api/auth/register/company");
    }
    const result = await authService.registerDeveloper({
      email,
      password,
      name: name ?? email.split("@")[0]
    });
    res.status(201).json(result);
  },

  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, "Invalid request", parsed.error.flatten().fieldErrors);
    res.json(await authService.login(parsed.data));
  },

  async refresh(req: Request, res: Response) {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, "Invalid request", parsed.error.flatten().fieldErrors);
    res.json(await authService.refresh(parsed.data.refreshToken));
  },

  async logout(req: Request, res: Response) {
    const refreshToken = req.body?.refreshToken as string | undefined;
    res.json(await authService.logout(refreshToken, req.user ? String(req.user._id) : undefined));
  },

  async me(req: Request, res: Response) {
    if (!req.user) throw new AppError(401, "Authentication required");
    res.json({
      id: String(req.user._id),
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      organizationId: req.user.organizationId ? String(req.user.organizationId) : null,
      mustChangePassword: req.user.mustChangePassword ?? false
    });
  },

  async forgotPassword(req: Request, res: Response) {
    const email = z.string().email().safeParse(req.body?.email);
    if (!email.success) throw new AppError(400, "Valid email required");
    res.json(await authService.forgotPassword(email.data));
  },

  async updateProfile(req: Request, res: Response) {
    if (!req.user) throw new AppError(401, "Authentication required");
    const name = z.string().trim().min(2).max(120).optional().safeParse(req.body?.name);
    if (!name.success) throw new AppError(400, "Invalid name");
    res.json(await authService.updateProfile(String(req.user._id), { name: name.data }));
  }
};
