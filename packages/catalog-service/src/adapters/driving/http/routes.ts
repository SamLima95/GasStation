import { Router, Request, Response, NextFunction } from "express";
import { asyncHandler, requirePermission } from "@lframework/shared";
import { ItemController } from "./item.controller";
import { validateCreateItem } from "./item.validation";

const CATALOG_ADMIN_PERMISSIONS = ["catalog:items:create"];
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: CATALOG_ADMIN_PERMISSIONS,
  admin_holding: CATALOG_ADMIN_PERMISSIONS,
  gerente: CATALOG_ADMIN_PERMISSIONS,
  manager: CATALOG_ADMIN_PERMISSIONS,
  operador: [],
  user: [],
};

function resolvePermissions(req: Request): string[] {
  return ROLE_PERMISSIONS[req.userRole ?? "user"] ?? [];
}

/**
 * Política de acesso: GET /api/items é público (listagem).
 * POST /api/items exige autenticação JWT (apenas usuários autenticados podem criar itens).
 */
export function createItemRoutes(
  controller: ItemController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
): Router {
  const router = Router();
  router.get("/items", asyncHandler(controller.list.bind(controller)));
  router.post("/items", authMiddleware, requirePermission("catalog:items:create", resolvePermissions), validateCreateItem, asyncHandler(controller.create.bind(controller)));
  return router;
}
