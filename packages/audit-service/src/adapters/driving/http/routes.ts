import { Router, Request, Response, NextFunction } from "express";
import { asyncHandler } from "@lframework/shared";
import { AuditoriaController } from "./auditoria.controller";

export function createAuditRoutes(
  controller: AuditoriaController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
): Router {
  const router = Router();
  router.get("/auditoria", authMiddleware, asyncHandler(controller.list.bind(controller)));
  return router;
}
