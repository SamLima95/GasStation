import { Router, Request, Response, NextFunction } from "express";
import { asyncHandler, requireRole } from "@lframework/shared";
import { UnidadeController } from "./unidade.controller";
import { validateCreateUnidade, validateLinkUserToUnidade, validateUpsertConfiguracao } from "./unidade.validation";

export function createUnidadeRoutes(
  controller: UnidadeController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
): Router {
  const router = Router();

  // Unidades CRUD
  router.post("/unidades", validateCreateUnidade, authMiddleware, requireRole("admin"), asyncHandler(controller.create.bind(controller)));
  router.get("/unidades", authMiddleware, asyncHandler(controller.list.bind(controller)));
  router.get("/unidades/:id", authMiddleware, asyncHandler(controller.getById.bind(controller)));

  // Configurações de unidade
  router.put("/unidades/:id/configuracoes", validateUpsertConfiguracao, authMiddleware, requireRole("admin"), asyncHandler(controller.upsertConfiguracao.bind(controller)));
  router.get("/unidades/:id/configuracoes", authMiddleware, asyncHandler(controller.listConfiguracoes.bind(controller)));

  // Vínculo usuário-unidade
  router.post("/unidades/usuarios", validateLinkUserToUnidade, authMiddleware, requireRole("admin"), asyncHandler(controller.linkUser.bind(controller)));
  router.get("/unidades/usuarios/:userId", authMiddleware, asyncHandler(controller.listUserUnidades.bind(controller)));

  return router;
}
