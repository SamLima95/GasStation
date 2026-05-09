import { Router, Request, Response, NextFunction } from "express";
import { asyncHandler, requirePermission } from "@lframework/shared";
import { VasilhameController } from "./vasilhame.controller";
import { MovimentacaoController } from "./movimentacao.controller";
import { ComodatoController } from "./comodato.controller";
import { RelatorioController } from "./relatorio.controller";
import { validateCreateVasilhame } from "./vasilhame.validation";
import { validateCreateMovimentacao } from "./movimentacao.validation";
import { validateCreateComodato } from "./comodato.validation";

const STOCK_ADMIN_PERMISSIONS = [
  "stock:vasilhames:create",
  "stock:movimentacoes:read",
  "stock:movimentacoes:create",
  "stock:comodatos:read",
  "stock:comodatos:create",
  "stock:relatorios:anp",
];
const STOCK_OPERATOR_PERMISSIONS = [
  "stock:movimentacoes:read",
  "stock:movimentacoes:create",
  "stock:comodatos:read",
  "stock:comodatos:create",
];
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: STOCK_ADMIN_PERMISSIONS,
  admin_holding: STOCK_ADMIN_PERMISSIONS,
  gerente: STOCK_ADMIN_PERMISSIONS,
  manager: STOCK_ADMIN_PERMISSIONS,
  operador: STOCK_OPERATOR_PERMISSIONS,
  user: STOCK_OPERATOR_PERMISSIONS,
};

function resolvePermissions(req: Request): string[] {
  return ROLE_PERMISSIONS[req.userRole ?? "user"] ?? [];
}

/**
 * Política de acesso:
 * GET /api/vasilhames é público (listagem de tipos).
 * Todas as demais rotas exigem autenticação JWT.
 */
export function createStockRoutes(
  vasilhameController: VasilhameController,
  movimentacaoController: MovimentacaoController,
  comodatoController: ComodatoController,
  relatorioController: RelatorioController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
): Router {
  const router = Router();

  // Vasilhames
  router.get("/vasilhames", asyncHandler(vasilhameController.list.bind(vasilhameController)));
  router.post("/vasilhames", authMiddleware, requirePermission("stock:vasilhames:create", resolvePermissions), validateCreateVasilhame, asyncHandler(vasilhameController.create.bind(vasilhameController)));

  // Movimentacoes
  router.get("/movimentacoes", authMiddleware, requirePermission("stock:movimentacoes:read", resolvePermissions), asyncHandler(movimentacaoController.list.bind(movimentacaoController)));
  router.post("/movimentacoes", authMiddleware, requirePermission("stock:movimentacoes:create", resolvePermissions), validateCreateMovimentacao, asyncHandler(movimentacaoController.create.bind(movimentacaoController)));

  // Comodatos
  router.get("/comodatos", authMiddleware, requirePermission("stock:comodatos:read", resolvePermissions), asyncHandler(comodatoController.list.bind(comodatoController)));
  router.post("/comodatos", authMiddleware, requirePermission("stock:comodatos:create", resolvePermissions), validateCreateComodato, asyncHandler(comodatoController.create.bind(comodatoController)));

  // Relatórios
  router.get("/relatorios/anp", authMiddleware, requirePermission("stock:relatorios:anp", resolvePermissions), asyncHandler(relatorioController.generateAnp.bind(relatorioController)));

  return router;
}
