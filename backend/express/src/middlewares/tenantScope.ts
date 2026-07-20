import { Request, Response, NextFunction } from "express";

export function tenantScope(req: Request, _res: Response, next: NextFunction) {
  const headerTenant = req.headers["x-tenant-id"] as string;
  const userTenant = (req as any).user?.tenantId;

  const tenantId = userTenant || headerTenant || "default-tenant";
  (req as any).tenantId = tenantId;

  next();
}
