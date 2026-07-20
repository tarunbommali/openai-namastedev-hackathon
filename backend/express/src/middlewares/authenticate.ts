import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import { AppError } from "../utils/errors";
import { verifyAccessToken } from "../utils/tokens";

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new AppError(401, "Authentication required"));
  }
  try {
    const token = header.slice(7);
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      return next(new AppError(401, "Invalid or inactive user"));
    }
    if (user.tokenVersion !== payload.tokenVersion) {
      return next(new AppError(401, "Token revoked"));
    }
    req.user = user;
    return next();
  } catch {
    return next(new AppError(401, "Invalid or expired access token"));
  }
}
