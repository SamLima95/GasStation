import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExportController } from "../../src/adapters/driving/http/export.controller";
import type { ExportDashboardUseCase } from "../../src/application/use-cases/export-dashboard.use-case";
import type { Response, NextFunction } from "express";
import { createMockRequest, createMockResponse } from "@lframework/shared/test";

describe("ExportController", () => {
  let exportUseCase: { exportCsv: ReturnType<typeof vi.fn>; exportPdf: ReturnType<typeof vi.fn> };
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    exportUseCase = {
      exportCsv: vi.fn().mockResolvedValue("Secao,Metrica,Valor\nResumo,Total,10"),
      exportPdf: vi.fn().mockResolvedValue(Buffer.from("%PDF-1.4 test")),
    };
    res = createMockResponse();
    next = vi.fn() as unknown as NextFunction;
  });

  describe("exportCsv", () => {
    it("deve retornar CSV com headers corretos", async () => {
      const controller = new ExportController(exportUseCase as unknown as ExportDashboardUseCase);
      const req = createMockRequest({
        query: { unidadeId: "u1" } as any,
        headers: { authorization: "Bearer tok" },
      });

      await controller.exportCsv(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/csv; charset=utf-8");
      expect(res.setHeader).toHaveBeenCalledWith("Content-Disposition", 'attachment; filename="dashboard.csv"');
      expect(res.send).toHaveBeenCalledWith("Secao,Metrica,Valor\nResumo,Total,10");
    });

    it("deve passar filtros e auth ao use case", async () => {
      const controller = new ExportController(exportUseCase as unknown as ExportDashboardUseCase);
      const req = createMockRequest({
        query: { unidadeId: "u1", dataInicio: "2025-01-01", dataFim: "2025-12-31" } as any,
        headers: { authorization: "Bearer tok" },
      });

      await controller.exportCsv(req, res, next);

      expect(exportUseCase.exportCsv).toHaveBeenCalledWith(
        { unidadeId: "u1", dataInicio: "2025-01-01", dataFim: "2025-12-31" },
        "Bearer tok"
      );
    });

    it("deve chamar next(err) em caso de erro", async () => {
      const error = new Error("fail");
      exportUseCase.exportCsv.mockRejectedValue(error);

      const controller = new ExportController(exportUseCase as unknown as ExportDashboardUseCase);
      await controller.exportCsv(createMockRequest(), res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("exportPdf", () => {
    it("deve retornar PDF com headers corretos", async () => {
      const controller = new ExportController(exportUseCase as unknown as ExportDashboardUseCase);
      const req = createMockRequest({ headers: { authorization: "Bearer tok" } });

      await controller.exportPdf(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/pdf");
      expect(res.setHeader).toHaveBeenCalledWith("Content-Disposition", 'attachment; filename="dashboard.pdf"');
      expect(res.send).toHaveBeenCalled();
    });

    it("deve chamar next(err) em caso de erro", async () => {
      const error = new Error("fail");
      exportUseCase.exportPdf.mockRejectedValue(error);

      const controller = new ExportController(exportUseCase as unknown as ExportDashboardUseCase);
      await controller.exportPdf(createMockRequest(), res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
