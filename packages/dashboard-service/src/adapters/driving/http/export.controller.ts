import { Request, Response, NextFunction } from "express";
import { ExportDashboardUseCase } from "../../../application/use-cases/export-dashboard.use-case";
import type { DashboardFilterDto } from "../../../application/dtos/dashboard.dto";

export class ExportController {
  constructor(private readonly exportDashboardUseCase: ExportDashboardUseCase) {}

  exportCsv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = this.parseFilter(req);
      const authHeader = req.headers.authorization;
      const csv = await this.exportDashboardUseCase.exportCsv(filter, authHeader);

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="dashboard.csv"');
      res.send(csv);
    } catch (err) {
      next(err);
    }
  };

  exportPdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = this.parseFilter(req);
      const authHeader = req.headers.authorization;
      const pdf = await this.exportDashboardUseCase.exportPdf(filter, authHeader);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="dashboard.pdf"');
      res.send(pdf);
    } catch (err) {
      next(err);
    }
  };

  private parseFilter(req: Request): DashboardFilterDto {
    return {
      unidadeId: typeof req.query.unidadeId === "string" ? req.query.unidadeId : undefined,
      dataInicio: typeof req.query.dataInicio === "string" ? req.query.dataInicio : undefined,
      dataFim: typeof req.query.dataFim === "string" ? req.query.dataFim : undefined,
    };
  }
}
