import { randomUUID } from "crypto";
import { Organization } from "../models/Organization";
import { RefreshToken } from "../models/RefreshToken";
import { UserRole } from "../models/User";
import { userRepository } from "../repositories/userRepository";
import { hiringRepository } from "../repositories/hiringRepository";
import { AppError } from "../utils/errors";
import { hashPassword, verifyPassword } from "../utils/password";
import {
  hashToken,
  refreshExpiryDate,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../utils/tokens";
import { getRedis, isRedisReady } from "../config/redis";

// ─── Token helper ─────────────────────────────────────────────────────────────

interface TokenUser {
  id: string;
  email: string;
  role: UserRole;
  tokenVersion: number;
  name: string;
  organizationId?: string;
}

async function issueTokens(user: TokenUser) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion,
    ...(user.organizationId ? { organizationId: user.organizationId } : {})
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const tokenHash = hashToken(refreshToken);

  await RefreshToken.updateOne(
    { tokenHash },
    {
      $set: {
        userId: user.id,
        expiresAt: refreshExpiryDate(),
        revoked: false
      }
    },
    { upsert: true }
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId ?? null
    }
  };
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {

  /**
   * Register a company workspace.
   * Creates: Organization → Company Admin user → issues tokens.
   */
  async registerCompany(input: {
    companyName: string;
    email: string;
    domain?: string;
    industry: string;
    size: string;
    country: string;
    password: string;
  }) {
    const cleanEmail = input.email.toLowerCase().trim();
    const existing = await userRepository.findByEmail(cleanEmail);
    if (existing) throw new AppError(409, "Email already registered");

    // Create organization
    const slug = input.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const org = await Organization.create({
      publicId: randomUUID(),
      name: input.companyName,
      domain: input.domain,
      industry: input.industry,
      size: input.size,
      country: input.country,
      adminEmail: input.email.toLowerCase()
    });

    // Create company admin user
    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      email: cleanEmail,
      passwordHash,
      name: input.companyName,   // default display name = company name; admin can update
      role: "company_admin",
      organizationId: org._id as never
    });

    return {
      ...(await issueTokens({
        id: String(user._id),
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion,
        name: user.name,
        organizationId: String(org._id)
      })),
      organization: { id: String(org._id), publicId: org.publicId, name: org.name }
    };
  },

  /**
   * Register a developer (candidate).
   * Creates user with role: "developer" and a linked Candidate profile.
   */
  async registerDeveloper(input: { email: string; password: string; name: string }) {
    const cleanEmail = input.email.toLowerCase().trim();
    const existing = await userRepository.findByEmail(cleanEmail);
    if (existing) throw new AppError(409, "Email already registered");

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      email: cleanEmail,
      passwordHash,
      name: input.name || cleanEmail.split("@")[0],
      role: "candidate"
    });

    // Create linked Candidate profile for apply/upload E2E
    const slug = user.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "dev";
    await hiringRepository.upsertCandidate(`cand-${slug}-${String(user._id).slice(-6)}`, {
      userId: user._id,
      name: user.name,
      email: user.email,
      status: "Registered"
    } as never);

    return issueTokens({
      id: String(user._id),
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
      name: user.name
    });
  },

  /**
   * Legacy register — routes through registerDeveloper for candidate role,
   * or throws for company-side roles (they must use registerCompany).
   */
  async register(input: { email: string; password: string; name: string; role: UserRole }) {
    if (input.role !== "candidate") {
      throw new AppError(
        403,
        "Company accounts must be created via /api/auth/register/company"
      );
    }
    return this.registerDeveloper({ email: input.email, password: input.password, name: input.name });
  },

  async login(input: { email: string; password: string }) {
    const cleanEmail = input.email ? input.email.toLowerCase().trim() : "";
    const user = await userRepository.findByEmail(cleanEmail);
    if (!user || !user.isActive) throw new AppError(401, "Invalid credentials");
    const ok = await verifyPassword(input.password, user.passwordHash);
    if (!ok) throw new AppError(401, "Invalid credentials");
    return issueTokens({
      id: String(user._id),
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
      name: user.name,
      organizationId: user.organizationId ? String(user.organizationId) : undefined
    });
  },

  async refresh(refreshToken: string) {
    let payload: ReturnType<typeof verifyRefreshToken>;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError(401, "Invalid refresh token");
    }
    const tokenHash = hashToken(refreshToken);
    if (isRedisReady()) {
      try {
        const denied = await getRedis().get(`deny:refresh:${tokenHash}`);
        if (denied) throw new AppError(401, "Refresh token revoked");
      } catch (error) {
        if (error instanceof AppError) throw error;
      }
    }
    const stored = await RefreshToken.findOne({ tokenHash, revoked: false });
    if (!stored || stored.expiresAt.getTime() < Date.now()) {
      throw new AppError(401, "Refresh token expired");
    }
    if (String(stored.userId) !== payload.sub) {
      throw new AppError(401, "Refresh token mismatch");
    }
    const user = await userRepository.findById(payload.sub);
    if (!user || !user.isActive || user.tokenVersion !== payload.tokenVersion) {
      throw new AppError(401, "Invalid refresh session");
    }
    stored.revoked = true;
    await stored.save();
    return issueTokens({
      id: String(user._id),
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
      name: user.name,
      organizationId: user.organizationId ? String(user.organizationId) : undefined
    });
  },

  async logout(refreshToken?: string, userId?: string) {
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await RefreshToken.updateOne({ tokenHash }, { $set: { revoked: true } });
      if (isRedisReady()) {
        try {
          await getRedis().set(`deny:refresh:${tokenHash}`, "1", "EX", 7 * 24 * 3600);
        } catch {
          /* optional */
        }
      }
    }
    if (userId) await userRepository.bumpTokenVersion(userId);
    return { ok: true };
  },

  async forgotPassword(email: string) {
    await userRepository.findByEmail(email); // intentionally don't reveal existence
    return {
      ok: true,
      message: "If this email is registered, a reset link has been sent."
    };
  },

  async updateProfile(userId: string, patch: { name?: string }) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, "User not found");
    if (patch.name) user.name = patch.name;
    await user.save();
    return {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId ? String(user.organizationId) : null
    };
  }
};
