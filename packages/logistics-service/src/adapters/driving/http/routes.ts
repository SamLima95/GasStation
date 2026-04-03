import { Router, Request, Response, NextFunction } from "express";
import { asyncHandler } from "@lframework/shared";
import { EntregadorController } from "./entregador.controller";
import { VeiculoController } from "./veiculo.controller";
import { RotaController } from "./rota.controller";
import { EntregaController } from "./entrega.controller";
import { validateCreateEntregador, validateCreateVeiculo, validateCreateRota } from "./validations";

export function createLogisticsRoutes(
  entregadorCtrl: EntregadorController, veiculoCtrl: VeiculoController,
  rotaCtrl: RotaController, entregaCtrl: EntregaController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
): Router {
  const r = Router();

  r.get("/entregadores", authMiddleware, asyncHandler(entregadorCtrl.list.bind(entregadorCtrl)));
  r.post("/entregadores", authMiddleware, validateCreateEntregador, asyncHandler(entregadorCtrl.create.bind(entregadorCtrl)));

  r.get("/veiculos", authMiddleware, asyncHandler(veiculoCtrl.list.bind(veiculoCtrl)));
  r.post("/veiculos", authMiddleware, validateCreateVeiculo, asyncHandler(veiculoCtrl.create.bind(veiculoCtrl)));

  r.get("/rotas", authMiddleware, asyncHandler(rotaCtrl.list.bind(rotaCtrl)));
  r.post("/rotas", authMiddleware, validateCreateRota, asyncHandler(rotaCtrl.create.bind(rotaCtrl)));
  r.post("/rotas/:id/optimize", authMiddleware, asyncHandler(rotaCtrl.optimize.bind(rotaCtrl)));

  r.get("/entregas", authMiddleware, asyncHandler(entregaCtrl.list.bind(entregaCtrl)));
  r.patch("/entregas/:id/assign", authMiddleware, asyncHandler(entregaCtrl.assign.bind(entregaCtrl)));
  r.patch("/entregas/:id/confirm", authMiddleware, asyncHandler(entregaCtrl.confirm.bind(entregaCtrl)));

  return r;
}
