import { NextFunction, Request, Response } from "express";
import { toErrorResponse } from "../utils/errors";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const { status, body } = toErrorResponse(err);
  res.status(status).json(body);
}
