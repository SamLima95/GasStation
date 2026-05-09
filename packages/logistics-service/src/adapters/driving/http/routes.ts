import { Router, Request, Response, NextFunction } from "express";
import { asyncHandler, requirePermission } from "@lframework/shared";
import { EntregadorController } from "./entregador.controller";
import { VeiculoController } from "./veiculo.controller";
import { RotaController } from "./rota.controller";
import { EntregaController } from "./entrega.controller";
import { validateCreateEntregador, validateCreateVeiculo, validateCreateRota } from "./validations";

const LOGISTICS_ADMIN_PERMISSIONS = [
  "logistics:entregadores:read",
  "logistics:entregadores:create",
  "logistics:veiculos:read",
  "logistics:veiculos:create",
  "logistics:rotas:read",
  "logistics:rotas:create",
  "logistics:rotas:optimize",
  "logistics:entregas:read",
  "logistics:entregas:assign",
  "logistics:entregas:confirm",
];
const LOGISTICS_OPERATOR_PERMISSIONS = [
  "logistics:entregadores:read",
  "logistics:veiculos:read",
  "logistics:rotas:read",
  "logistics:entregas:read",
  "logistics:entregas:assign",
  "logistics:entregas:confirm",
];
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: LOGISTICS_ADMIN_PERMISSIONS,
  admin_holding: LOGISTICS_ADMIN_PERMISSIONS,
  gerente: LOGISTICS_ADMIN_PERMISSIONS,
  manager: LOGISTICS_ADMIN_PERMISSIONS,
  operador: LOGISTICS_OPERATOR_PERMISSIONS,
  user: LOGISTICS_OPERATOR_PERMISSIONS,
};

function resolvePermissions(req: Request): string[] {
  return ROLE_PERMISSIONS[req.userRole ?? "user"] ?? [];
}

export function createLogisticsRoutes(
  entregadorCtrl: EntregadorController, veiculoCtrl: VeiculoController,
  rotaCtrl: RotaController, entregaCtrl: EntregaController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
): Router {
  const r = Router();

  r.get("/entregadores", authMiddleware, requirePermission("logistics:entregadores:read", resolvePermissions), asyncHandler(entregadorCtrl.list.bind(entregadorCtrl)));
  r.post("/entregadores", authMiddleware, requirePermission("logistics:entregadores:create", resolvePermissions), validateCreateEntregador, asyncHandler(entregadorCtrl.create.bind(entregadorCtrl)));

  r.get("/veiculos", authMiddleware, requirePermission("logistics:veiculos:read", resolvePermissions), asyncHandler(veiculoCtrl.list.bind(veiculoCtrl)));
  r.post("/veiculos", authMiddleware, requirePermission("logistics:veiculos:create", resolvePermissions), validateCreateVeiculo, asyncHandler(veiculoCtrl.create.bind(veiculoCtrl)));

  r.get("/rotas", authMiddleware, requirePermission("logistics:rotas:read", resolvePermissions), asyncHandler(rotaCtrl.list.bind(rotaCtrl)));
  r.post("/rotas", authMiddleware, requirePermission("logistics:rotas:create", resolvePermissions), validateCreateRota, asyncHandler(rotaCtrl.create.bind(rotaCtrl)));
  r.post("/rotas/:id/optimize", authMiddleware, requirePermission("logistics:rotas:optimize", resolvePermissions), asyncHandler(rotaCtrl.optimize.bind(rotaCtrl)));

  r.get("/entregas", authMiddleware, requirePermission("logistics:entregas:read", resolvePermissions), asyncHandler(entregaCtrl.list.bind(entregaCtrl)));
  r.patch("/entregas/:id/assign", authMiddleware, requirePermission("logistics:entregas:assign", resolvePermissions), asyncHandler(entregaCtrl.assign.bind(entregaCtrl)));
  r.patch("/entregas/:id/confirm", authMiddleware, requirePermission("logistics:entregas:confirm", resolvePermissions), asyncHandler(entregaCtrl.confirm.bind(entregaCtrl)));

  return r;
}
