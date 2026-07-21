import { NextFunction, Request, Response } from "express";
import { UserRole } from "../models/User";
import { AppError } from "../utils/errors";

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError(401, "Authentication required"));

    const userRole = req.user.role;

    // Direct role match
    if (roles.includes(userRole)) return next();

    // Legacy alias: "admin" acts as "company_admin"
    if (userRole === "admin" && roles.includes("company_admin")) return next();
    if (userRole === "company_admin" && roles.includes("admin")) return next();

    return next(new AppError(403, "Insufficient permissions"));
  };
}
