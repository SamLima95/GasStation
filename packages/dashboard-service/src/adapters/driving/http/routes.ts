import { Router, Request, Response, NextFunction } from "express";
import { asyncHandler } from "@lframework/shared";
import { DashboardController } from "./dashboard.controller";

export function createDashboardRoutes(
  controller: DashboardController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
): Router {
  const router = Router();
  router.get("/dashboard", authMiddleware, asyncHandler(controller.getDashboard.bind(controller)));
  return router;
}
