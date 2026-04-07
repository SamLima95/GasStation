import { Router, Request, Response, NextFunction } from "express";
import { asyncHandler } from "@lframework/shared";
import { DashboardController } from "./dashboard.controller";
import { ExportController } from "./export.controller";

export function createDashboardRoutes(
  controller: DashboardController,
  exportController: ExportController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
): Router {
  const router = Router();
  router.get("/dashboard", authMiddleware, asyncHandler(controller.getDashboard.bind(controller)));
  router.get("/dashboard/export/csv", authMiddleware, asyncHandler(exportController.exportCsv.bind(exportController)));
  router.get("/dashboard/export/pdf", authMiddleware, asyncHandler(exportController.exportPdf.bind(exportController)));
  return router;
}
