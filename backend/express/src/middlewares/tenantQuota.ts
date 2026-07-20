import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Tenant } from "../models/Tenant";
import { TenantUsage } from "../models/TenantUsage";
import { AppError } from "../utils/errors";

const PLAN_LIMITS: Record<string, { monthlyResumes: number; monthlyPipelineRuns: number }> = {
  trial: { monthlyResumes: 50, monthlyPipelineRuns: 30 },
  agency_starter: { monthlyResumes: 500, monthlyPipelineRuns: 300 },
  agency_pro: { monthlyResumes: 2500, monthlyPipelineRuns: 1500 },
  enterprise: { monthlyResumes: 10000, monthlyPipelineRuns: 5000 }
};

export async function tenantQuotaMiddleware(req: Request, _res: Response, next: NextFunction) {
  // If MongoDB is not connected (e.g. mock test environment), skip quota DB lookup
  if (mongoose.connection.readyState !== 1) {
    return next();
  }

  const tenantId = (req as any).tenantId || "default-tenant";
  const now = new Date();
  const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  try {
    const tenant = await Tenant.findOne({ publicId: tenantId }).maxTimeMS(2000);
    const plan = tenant?.plan || "trial";
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.trial;

    const usage = await TenantUsage.findOne({ tenantId, monthYear }).maxTimeMS(2000);
    if (usage) {
      if (usage.resumesProcessed >= limits.monthlyResumes) {
        throw new AppError(
          429,
          `Monthly resume screening quota exceeded for tenant plan '${plan}' (${limits.monthlyResumes} resumes/mo max). Upgrade plan at /billing.`,
          { quotaExceeded: true, currentUsage: usage.resumesProcessed, limit: limits.monthlyResumes }
        );
      }
    }
    next();
  } catch (error: any) {
    if (error instanceof AppError) {
      return next(error);
    }
    // Fail open if database lookup times out during quota check
    next();
  }
}

