import { Router, Request, Response, NextFunction } from "express";
import { asyncHandler, requirePermission } from "@lframework/shared";
import { UnidadeController } from "./unidade.controller";
import { validateCreateUnidade, validateLinkUserToUnidade, validateUpsertConfiguracao } from "./unidade.validation";
import { ListRolePermissionsUseCase } from "../../../application/use-cases/list-role-permissions.use-case";

export function createUnidadeRoutes(
  controller: UnidadeController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void,
  listRolePermissionsUseCase: ListRolePermissionsUseCase
): Router {
  const router = Router();
  const permissionResolver = (req: Request) =>
    listRolePermissionsUseCase.execute(req.userRole ?? "user");

  // Unidades CRUD
  router.post("/unidades", validateCreateUnidade, authMiddleware, requirePermission("unidades:create", permissionResolver), asyncHandler(controller.create.bind(controller)));
  router.get("/unidades", authMiddleware, asyncHandler(controller.list.bind(controller)));
  router.get("/unidades/:id", authMiddleware, asyncHandler(controller.getById.bind(controller)));

  // Configurações de unidade
  router.put("/unidades/:id/configuracoes", validateUpsertConfiguracao, authMiddleware, requirePermission("unidades:update:config", permissionResolver), asyncHandler(controller.upsertConfiguracao.bind(controller)));
  router.get("/unidades/:id/configuracoes", authMiddleware, asyncHandler(controller.listConfiguracoes.bind(controller)));

  // Vínculo usuário-unidade
  router.post("/unidades/usuarios", validateLinkUserToUnidade, authMiddleware, requirePermission("unidades:link-user", permissionResolver), asyncHandler(controller.linkUser.bind(controller)));
  router.get("/unidades/usuarios/:userId", authMiddleware, asyncHandler(controller.listUserUnidades.bind(controller)));

  return router;
}
