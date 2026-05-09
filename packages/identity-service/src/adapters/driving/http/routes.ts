import { Router, Request, Response, NextFunction } from "express";
import { asyncHandler, requirePermission } from "@lframework/shared";
import { UserController } from "./user.controller";
import { validateCreateUser, validateUpdateUser } from "./user.validation";
import { ListRolePermissionsUseCase } from "../../../application/use-cases/list-role-permissions.use-case";

export function createUserRoutes(
  controller: UserController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void,
  listRolePermissionsUseCase: ListRolePermissionsUseCase
): Router {
  const router = Router();
  const permissionResolver = (req: Request) =>
    listRolePermissionsUseCase.execute(req.userRole ?? "user");

  router.post("/users", validateCreateUser, authMiddleware, requirePermission("users:create", permissionResolver), asyncHandler(controller.create.bind(controller)));
  router.get("/users/:id", authMiddleware, asyncHandler(controller.getById.bind(controller)));
  router.patch("/users/:id", validateUpdateUser, authMiddleware, requirePermission("users:update:any", permissionResolver), asyncHandler(controller.update.bind(controller)));
  router.delete("/users/:id", authMiddleware, requirePermission("users:deactivate:any", permissionResolver), asyncHandler(controller.deactivate.bind(controller)));
  return router;
}
