import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { Organization } from "../models/Organization";
import { User } from "../models/User";
import { AppError } from "../utils/errors";
import { hashPassword } from "../utils/password";
import { z } from "zod";

// ─── Validators ──────────────────────────────────────────────────────────────

const inviteSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email(),
  role: z.enum(["recruiter", "interviewer"]),
  tempPassword: z.string().min(8)
});

const updateRoleSchema = z.object({
  role: z.enum(["recruiter", "interviewer", "company_admin"])
});

// ─── Controller ──────────────────────────────────────────────────────────────

export const orgController = {

  /**
   * GET /org/me
   * Returns the caller's organization details.
   */
  async getOrg(req: Request, res: Response) {
    if (!req.user?.organizationId) throw new AppError(403, "No organization context");
    const org = await Organization.findById(req.user.organizationId).lean();
    if (!org) throw new AppError(404, "Organization not found");
    res.json({
      id: String(org._id),
      publicId: org.publicId,
      name: org.name,
      domain: org.domain,
      industry: org.industry,
      size: org.size,
      country: org.country,
      plan: org.plan,
      status: org.status,
      adminEmail: org.adminEmail
    });
  },

  /**
   * GET /org/users
   * Lists all users in the caller's organization.
   */
  async listUsers(req: Request, res: Response) {
    if (!req.organizationId) throw new AppError(403, "No organization context");
    const users = await User.find({ organizationId: req.organizationId })
      .select("name email role isActive mustChangePassword createdAt")
      .lean();
    res.json(
      users.map((u) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        mustChangePassword: u.mustChangePassword ?? false,
        createdAt: u.createdAt
      }))
    );
  },

  /**
   * POST /org/invite
   * Company admin invites a Recruiter or Interviewer.
   * Creates the user with a temp password that must be changed on first login.
   */
  async inviteUser(req: Request, res: Response) {
    if (!req.organizationId) throw new AppError(403, "No organization context");

    const parsed = inviteSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, "Invalid request", parsed.error.flatten().fieldErrors);

    const { name, email, role, tempPassword } = parsed.data;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new AppError(409, "Email is already registered");

    const passwordHash = await hashPassword(tempPassword);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name,
      role,
      organizationId: req.organizationId,
      isActive: true,
      mustChangePassword: true
    });

    res.status(201).json({
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      message: `${role} account created. Share the temp password with ${name} — they must change it on first login.`
    });
  },

  /**
   * PATCH /org/users/:id/role
   * Update a team member's role (company_admin only).
   */
  async updateUserRole(req: Request, res: Response) {
    if (!req.organizationId) throw new AppError(403, "No organization context");

    const parsed = updateRoleSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, "Invalid role");

    const user = await User.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!user) throw new AppError(404, "User not found in your organization");

    // Prevent admin from demoting themselves
    if (String(user._id) === String(req.user?._id) && parsed.data.role !== "company_admin") {
      throw new AppError(400, "You cannot change your own admin role");
    }

    user.role = parsed.data.role;
    await user.save();

    res.json({ id: String(user._id), role: user.role, message: "Role updated" });
  },

  /**
   * PATCH /org/users/:id/deactivate
   * Deactivate (soft-delete) a team member.
   */
  async deactivateUser(req: Request, res: Response) {
    if (!req.organizationId) throw new AppError(403, "No organization context");

    const user = await User.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!user) throw new AppError(404, "User not found in your organization");

    if (String(user._id) === String(req.user?._id)) {
      throw new AppError(400, "You cannot deactivate your own account");
    }

    user.isActive = false;
    user.tokenVersion += 1; // invalidate existing sessions
    await user.save();

    res.json({ message: "User deactivated and sessions revoked" });
  },

  /**
   * POST /org/users/:id/reset-password
   * Force a temp password reset for a user.
   */
  async resetUserPassword(req: Request, res: Response) {
    if (!req.organizationId) throw new AppError(403, "No organization context");

    const tempPassword = z.string().min(8).safeParse(req.body?.tempPassword);
    if (!tempPassword.success) throw new AppError(400, "tempPassword must be at least 8 characters");

    const user = await User.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!user) throw new AppError(404, "User not found in your organization");

    user.passwordHash = await hashPassword(tempPassword.data);
    user.mustChangePassword = true;
    user.tokenVersion += 1;
    await user.save();

    res.json({ message: "Password reset. User must change password on next login." });
  }
};
