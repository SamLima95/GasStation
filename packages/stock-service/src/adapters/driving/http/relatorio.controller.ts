import { Request, Response, NextFunction } from "express";
import { GenerateRelatorioAnpUseCase } from "../../../application/use-cases/generate-relatorio-anp.use-case";
import { sendError } from "@lframework/shared";

export class RelatorioController {
  constructor(private readonly generateAnpUseCase: GenerateRelatorioAnpUseCase) {}

  generateAnp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dataInicio = typeof req.query.dataInicio === "string" ? req.query.dataInicio : undefined;
      const dataFim = typeof req.query.dataFim === "string" ? req.query.dataFim : undefined;
      const unidadeId = typeof req.query.unidadeId === "string" ? req.query.unidadeId : undefined;

      if (!dataInicio || !dataFim) {
        sendError(res, 400, "Query params dataInicio e dataFim são obrigatórios");
        return;
      }

      const result = await this.generateAnpUseCase.execute({ dataInicio, dataFim, unidadeId });
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}
