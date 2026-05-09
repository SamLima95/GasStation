import { Router, Request, Response, NextFunction } from "express";
import { asyncHandler, requirePermission } from "@lframework/shared";
import { AuditoriaController } from "./auditoria.controller";

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ["audit:read"],
  admin_holding: ["audit:read"],
  gerente: ["audit:read"],
  manager: ["audit:read"],
  operador: [],
  user: [],
};

function resolvePermissions(req: Request): string[] {
  return ROLE_PERMISSIONS[req.userRole ?? "user"] ?? [];
}

export function createAuditRoutes(
  controller: AuditoriaController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
): Router {
  const router = Router();
  router.get("/auditoria", authMiddleware, requirePermission("audit:read", resolvePermissions), asyncHandler(controller.list.bind(controller)));
  return router;
}
