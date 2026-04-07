import { createHash } from "crypto";
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
      const authHeader = req.headers.authorization;
      const result = await this.getDashboardUseCase.execute(filter, authHeader);

      const body = JSON.stringify(result);
      const etag = `"${createHash("md5").update(body).digest("hex")}"`;

      res.setHeader("ETag", etag);
      res.setHeader("Cache-Control", "no-cache");

      if (req.headers["if-none-match"] === etag) {
        res.status(304).end();
        return;
      }

      res.setHeader("Content-Type", "application/json");
      res.send(body);
    } catch (err) {
      next(err);
    }
  };
}
