import { Request, Response, NextFunction } from "express";
import { GetDashboardUseCase } from "../../../application/use-cases/get-dashboard.use-case";
import type { DashboardFilterDto } from "../../../application/dtos/dashboard.dto";

export class DashboardController {
  constructor(private readonly getDashboardUseCase: GetDashboardUseCase) {}

  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter: DashboardFilterDto = {
        unidadeId: typeof req.query.unidadeId === "string" ? req.query.unidadeId : undefined,
        dataInicio: typeof req.query.dataInicio === "string" ? req.query.dataInicio : undefined,
        dataFim: typeof req.query.dataFim === "string" ? req.query.dataFim : undefined,
      };
      const result = await this.getDashboardUseCase.execute(filter);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}
