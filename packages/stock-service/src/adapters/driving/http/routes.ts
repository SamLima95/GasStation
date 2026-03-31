import { Router, Request, Response, NextFunction } from "express";
import { asyncHandler } from "@lframework/shared";
import { VasilhameController } from "./vasilhame.controller";
import { MovimentacaoController } from "./movimentacao.controller";
import { ComodatoController } from "./comodato.controller";
import { validateCreateVasilhame } from "./vasilhame.validation";
import { validateCreateMovimentacao } from "./movimentacao.validation";
import { validateCreateComodato } from "./comodato.validation";

/**
 * Política de acesso:
 * GET /api/vasilhames é público (listagem de tipos).
 * Todas as demais rotas exigem autenticação JWT.
 */
export function createStockRoutes(
  vasilhameController: VasilhameController,
  movimentacaoController: MovimentacaoController,
  comodatoController: ComodatoController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
): Router {
  const router = Router();

  // Vasilhames
  router.get("/vasilhames", asyncHandler(vasilhameController.list.bind(vasilhameController)));
  router.post("/vasilhames", authMiddleware, validateCreateVasilhame, asyncHandler(vasilhameController.create.bind(vasilhameController)));

  // Movimentacoes
  router.get("/movimentacoes", authMiddleware, asyncHandler(movimentacaoController.list.bind(movimentacaoController)));
  router.post("/movimentacoes", authMiddleware, validateCreateMovimentacao, asyncHandler(movimentacaoController.create.bind(movimentacaoController)));

  // Comodatos
  router.get("/comodatos", authMiddleware, asyncHandler(comodatoController.list.bind(comodatoController)));
  router.post("/comodatos", authMiddleware, validateCreateComodato, asyncHandler(comodatoController.create.bind(comodatoController)));

  return router;
}
