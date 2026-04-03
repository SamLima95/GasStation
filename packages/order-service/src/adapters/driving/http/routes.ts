import { Router, Request, Response, NextFunction } from "express";
import { asyncHandler } from "@lframework/shared";
import { ClienteController } from "./cliente.controller";
import { PedidoController } from "./pedido.controller";
import { validateCreateCliente } from "./cliente.validation";
import { validateCreatePedido } from "./pedido.validation";

/**
 * Todas as rotas do order-service exigem autenticação JWT.
 */
export function createOrderRoutes(
  clienteController: ClienteController,
  pedidoController: PedidoController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
): Router {
  const router = Router();

  // Clientes
  router.get("/clientes", authMiddleware, asyncHandler(clienteController.list.bind(clienteController)));
  router.post("/clientes", authMiddleware, validateCreateCliente, asyncHandler(clienteController.create.bind(clienteController)));

  // Pedidos
  router.get("/pedidos", authMiddleware, asyncHandler(pedidoController.list.bind(pedidoController)));
  router.post("/pedidos", authMiddleware, validateCreatePedido, asyncHandler(pedidoController.create.bind(pedidoController)));
  router.patch("/pedidos/:id/confirm", authMiddleware, asyncHandler(pedidoController.confirm.bind(pedidoController)));
  router.get("/pedidos/:id/nota-fiscal", authMiddleware, asyncHandler(pedidoController.getNotaFiscal.bind(pedidoController)));

  return router;
}
