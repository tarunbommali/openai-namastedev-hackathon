import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";

/**
 * Attaches req.organizationId from the authenticated user.
 * Must run AFTER authenticate middleware.
 * Developers (role: developer / candidate) intentionally have no organizationId —
 * this middleware is NOT applied to developer routes.
 */
export function orgIsolation(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(new AppError(401, "Authentication required"));
  if (!req.user.organizationId) {
    return next(new AppError(403, "No organization context. This endpoint requires a company account."));
  }
  req.organizationId = req.user.organizationId.toString();
  return next();
}
