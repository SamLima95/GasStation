import { describe, it, expect, vi, beforeEach } from "vitest";
import { DashboardController } from "../../src/adapters/driving/http/dashboard.controller";
import type { GetDashboardUseCase } from "../../src/application/use-cases/get-dashboard.use-case";
import type { DashboardDto } from "../../src/application/dtos/dashboard.dto";
import type { Response, NextFunction } from "express";
import { createMockRequest, createMockResponse } from "@lframework/shared/test";

const mockDashboard: DashboardDto = {
  periodo: { inicio: "2025-01-01", fim: "2025-12-31" },
  unidadeId: "u1",
  resumo: { totalPedidos: 10, pedidosConfirmados: 5, pedidosPendentes: 3, pedidosCancelados: 2, faturamentoTotal: 1000, ticketMedio: 200 },
  estoque: { totalMovimentacoes: 20, entradas: 10, saidas: 5, retornos: 3, avarias: 2 },
  financeiro: { caixasAbertos: 1, caixasFechados: 2, contasPendentes: 3, contasPagas: 4, contasVencidas: 1, valorTotalAberto: 500 },
  logistica: { totalRotas: 5, rotasPlanejadas: 1, rotasEmAndamento: 2, rotasFinalizadas: 2, totalEntregas: 10, entregasEntregues: 6, entregasPendentes: 4 },
  geradoEm: "2025-06-01T00:00:00.000Z",
};

describe("DashboardController", () => {
  let getDashboardUseCase: { execute: ReturnType<typeof vi.fn> };
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    getDashboardUseCase = { execute: vi.fn().mockResolvedValue(mockDashboard) };
    res = createMockResponse();
    next = vi.fn() as unknown as NextFunction;
  });

  it("deve retornar 200 com dados do dashboard", async () => {
    const controller = new DashboardController(getDashboardUseCase as unknown as GetDashboardUseCase);
    const req = createMockRequest({
      query: { unidadeId: "u1", dataInicio: "2025-01-01", dataFim: "2025-12-31" } as any,
      headers: { authorization: "Bearer tok123" },
    });

    await controller.getDashboard(req, res, next);

    expect(res.send).toHaveBeenCalledWith(JSON.stringify(mockDashboard));
    expect(res.setHeader).toHaveBeenCalledWith("ETag", expect.any(String));
    expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", "no-cache");
  });

  it("deve retornar 304 quando ETag coincide (If-None-Match)", async () => {
    const controller = new DashboardController(getDashboardUseCase as unknown as GetDashboardUseCase);

    // Primeira chamada para obter o ETag
    const req1 = createMockRequest({
      headers: { authorization: "Bearer tok123" },
    });
    const res1 = createMockResponse();
    await controller.getDashboard(req1, res1, next);

    const etag = (res1.setHeader as ReturnType<typeof vi.fn>).mock.calls.find(
      (c: unknown[]) => c[0] === "ETag"
    )?.[1] as string;

    // Segunda chamada com If-None-Match
    const req2 = createMockRequest({
      headers: { authorization: "Bearer tok123", "if-none-match": etag },
    });
    const res2 = createMockResponse();
    await controller.getDashboard(req2, res2, next);

    expect(res2.status).toHaveBeenCalledWith(304);
    expect(res2.end).toHaveBeenCalled();
  });

  it("deve passar filtro e auth header ao use case", async () => {
    const controller = new DashboardController(getDashboardUseCase as unknown as GetDashboardUseCase);
    const req = createMockRequest({
      query: { unidadeId: "u1", dataInicio: "2025-01-01", dataFim: "2025-12-31" } as any,
      headers: { authorization: "Bearer tok123" },
    });

    await controller.getDashboard(req, res, next);

    expect(getDashboardUseCase.execute).toHaveBeenCalledWith(
      { unidadeId: "u1", dataInicio: "2025-01-01", dataFim: "2025-12-31" },
      "Bearer tok123"
    );
  });

  it("deve funcionar sem query params (filtros undefined)", async () => {
    const controller = new DashboardController(getDashboardUseCase as unknown as GetDashboardUseCase);
    const req = createMockRequest();

    await controller.getDashboard(req, res, next);

    expect(getDashboardUseCase.execute).toHaveBeenCalledWith(
      { unidadeId: undefined, dataInicio: undefined, dataFim: undefined },
      undefined
    );
  });

  it("deve chamar next(err) quando use case lanca erro", async () => {
    const error = new Error("Service unavailable");
    getDashboardUseCase.execute.mockRejectedValue(error);

    const controller = new DashboardController(getDashboardUseCase as unknown as GetDashboardUseCase);
    const req = createMockRequest();

    await controller.getDashboard(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.send).not.toHaveBeenCalled();
  });
});
