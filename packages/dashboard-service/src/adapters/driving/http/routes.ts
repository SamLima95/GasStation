import { Router, Request, Response, NextFunction } from "express";
import { asyncHandler, requirePermission } from "@lframework/shared";
import { DashboardController } from "./dashboard.controller";
import { ExportController } from "./export.controller";

const DASHBOARD_ADMIN_PERMISSIONS = ["dashboard:view", "dashboard:export"];
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: DASHBOARD_ADMIN_PERMISSIONS,
  admin_holding: DASHBOARD_ADMIN_PERMISSIONS,
  gerente: DASHBOARD_ADMIN_PERMISSIONS,
  manager: DASHBOARD_ADMIN_PERMISSIONS,
  operador: ["dashboard:view"],
  user: ["dashboard:view"],
};

function resolvePermissions(req: Request): string[] {
  return ROLE_PERMISSIONS[req.userRole ?? "user"] ?? [];
}

export function createDashboardRoutes(
  controller: DashboardController,
  exportController: ExportController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
): Router {
  const router = Router();
  router.get("/dashboard", authMiddleware, requirePermission("dashboard:view", resolvePermissions), asyncHandler(controller.getDashboard.bind(controller)));
  router.get("/dashboard/export/csv", authMiddleware, requirePermission("dashboard:export", resolvePermissions), asyncHandler(exportController.exportCsv.bind(exportController)));
  router.get("/dashboard/export/pdf", authMiddleware, requirePermission("dashboard:export", resolvePermissions), asyncHandler(exportController.exportPdf.bind(exportController)));
  return router;
}
