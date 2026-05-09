import { Router, Request, Response, NextFunction } from "express";
import { asyncHandler, requirePermission } from "@lframework/shared";
import { CaixaController } from "./caixa.controller";
import { ContaAReceberController } from "./conta-a-receber.controller";
import { validateOpenCaixa } from "./caixa.validation";
import { validateCreateContaAReceber, validateReceivePayment } from "./conta-a-receber.validation";

const FINANCIAL_ADMIN_PERMISSIONS = [
  "financial:caixas:read",
  "financial:caixas:open",
  "financial:caixas:close",
  "financial:contas:read",
  "financial:contas:create",
  "financial:contas:receive-payment",
];
const FINANCIAL_OPERATOR_PERMISSIONS = [
  "financial:caixas:read",
  "financial:caixas:open",
  "financial:contas:read",
  "financial:contas:receive-payment",
];
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: FINANCIAL_ADMIN_PERMISSIONS,
  admin_holding: FINANCIAL_ADMIN_PERMISSIONS,
  gerente: FINANCIAL_ADMIN_PERMISSIONS,
  manager: FINANCIAL_ADMIN_PERMISSIONS,
  operador: FINANCIAL_OPERATOR_PERMISSIONS,
  user: FINANCIAL_OPERATOR_PERMISSIONS,
};

function resolvePermissions(req: Request): string[] {
  return ROLE_PERMISSIONS[req.userRole ?? "user"] ?? [];
}

export function createFinancialRoutes(
  caixaController: CaixaController,
  contaAReceberController: ContaAReceberController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
): Router {
  const router = Router();

  router.get("/caixas", authMiddleware, requirePermission("financial:caixas:read", resolvePermissions), asyncHandler(caixaController.list.bind(caixaController)));
  router.post("/caixas", authMiddleware, requirePermission("financial:caixas:open", resolvePermissions), validateOpenCaixa, asyncHandler(caixaController.open.bind(caixaController)));
  router.patch("/caixas/:id/close", authMiddleware, requirePermission("financial:caixas:close", resolvePermissions), asyncHandler(caixaController.close.bind(caixaController)));

  router.get("/contas-a-receber", authMiddleware, requirePermission("financial:contas:read", resolvePermissions), asyncHandler(contaAReceberController.list.bind(contaAReceberController)));
  router.post("/contas-a-receber", authMiddleware, requirePermission("financial:contas:create", resolvePermissions), validateCreateContaAReceber, asyncHandler(contaAReceberController.create.bind(contaAReceberController)));
  router.post("/contas-a-receber/:id/payment", authMiddleware, requirePermission("financial:contas:receive-payment", resolvePermissions), validateReceivePayment, asyncHandler(contaAReceberController.receivePayment.bind(contaAReceberController)));

  return router;
}
