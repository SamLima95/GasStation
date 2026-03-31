import { Router, Request, Response, NextFunction } from "express";
import { asyncHandler } from "@lframework/shared";
import { CaixaController } from "./caixa.controller";
import { ContaAReceberController } from "./conta-a-receber.controller";
import { validateOpenCaixa } from "./caixa.validation";
import { validateCreateContaAReceber, validateReceivePayment } from "./conta-a-receber.validation";

export function createFinancialRoutes(
  caixaController: CaixaController,
  contaAReceberController: ContaAReceberController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
): Router {
  const router = Router();

  router.get("/caixas", authMiddleware, asyncHandler(caixaController.list.bind(caixaController)));
  router.post("/caixas", authMiddleware, validateOpenCaixa, asyncHandler(caixaController.open.bind(caixaController)));
  router.patch("/caixas/:id/close", authMiddleware, asyncHandler(caixaController.close.bind(caixaController)));

  router.get("/contas-a-receber", authMiddleware, asyncHandler(contaAReceberController.list.bind(contaAReceberController)));
  router.post("/contas-a-receber", authMiddleware, validateCreateContaAReceber, asyncHandler(contaAReceberController.create.bind(contaAReceberController)));
  router.post("/contas-a-receber/:id/payment", authMiddleware, validateReceivePayment, asyncHandler(contaAReceberController.receivePayment.bind(contaAReceberController)));

  return router;
}
