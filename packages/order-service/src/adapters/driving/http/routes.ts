import { Router, Request, Response, NextFunction } from "express";
import { asyncHandler, requirePermission } from "@lframework/shared";
import { ClienteController } from "./cliente.controller";
import { PedidoController } from "./pedido.controller";
import { validateCreateCliente } from "./cliente.validation";
import { validateCreatePedido } from "./pedido.validation";

const ORDER_ADMIN_PERMISSIONS = [
  "orders:clientes:read",
  "orders:clientes:create",
  "orders:pedidos:read",
  "orders:pedidos:create",
  "orders:pedidos:confirm",
  "orders:nota-fiscal:read",
];
const ORDER_OPERATOR_PERMISSIONS = [
  "orders:clientes:read",
  "orders:clientes:create",
  "orders:pedidos:read",
  "orders:pedidos:create",
  "orders:nota-fiscal:read",
];
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ORDER_ADMIN_PERMISSIONS,
  admin_holding: ORDER_ADMIN_PERMISSIONS,
  gerente: ORDER_ADMIN_PERMISSIONS,
  manager: ORDER_ADMIN_PERMISSIONS,
  operador: ORDER_OPERATOR_PERMISSIONS,
  user: ORDER_OPERATOR_PERMISSIONS,
};

function resolvePermissions(req: Request): string[] {
  return ROLE_PERMISSIONS[req.userRole ?? "user"] ?? [];
}

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
  router.get("/clientes", authMiddleware, requirePermission("orders:clientes:read", resolvePermissions), asyncHandler(clienteController.list.bind(clienteController)));
  router.post("/clientes", authMiddleware, requirePermission("orders:clientes:create", resolvePermissions), validateCreateCliente, asyncHandler(clienteController.create.bind(clienteController)));

  // Pedidos
  router.get("/pedidos", authMiddleware, requirePermission("orders:pedidos:read", resolvePermissions), asyncHandler(pedidoController.list.bind(pedidoController)));
  router.post("/pedidos", authMiddleware, requirePermission("orders:pedidos:create", resolvePermissions), validateCreatePedido, asyncHandler(pedidoController.create.bind(pedidoController)));
  router.patch("/pedidos/:id/confirm", authMiddleware, requirePermission("orders:pedidos:confirm", resolvePermissions), asyncHandler(pedidoController.confirm.bind(pedidoController)));
  router.get("/pedidos/:id/nota-fiscal", authMiddleware, requirePermission("orders:nota-fiscal:read", resolvePermissions), asyncHandler(pedidoController.getNotaFiscal.bind(pedidoController)));

  return router;
}
