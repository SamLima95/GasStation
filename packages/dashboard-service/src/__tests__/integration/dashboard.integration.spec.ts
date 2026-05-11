import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import type { NextFunction, Request, Response } from "express";
import type { ICacheService } from "@lframework/shared";
import type { IServiceClient } from "../../application/ports/service-client.port";
import { createApp } from "../../app";
import { GetDashboardUseCase } from "../../application/use-cases/get-dashboard.use-case";
import { ExportDashboardUseCase } from "../../application/use-cases/export-dashboard.use-case";
import { DashboardController } from "../../adapters/driving/http/dashboard.controller";
import { ExportController } from "../../adapters/driving/http/export.controller";
import { createDashboardRoutes } from "../../adapters/driving/http/routes";

function createMemoryCache(): ICacheService {
  const store = new Map<string, unknown>();

  return {
    get: vi.fn(async <T>(key: string): Promise<T | null> => {
      return (store.get(key) as T | undefined) ?? null;
    }),
    set: vi.fn(async <T>(key: string, value: T): Promise<void> => {
      store.set(key, value);
    }),
    delete: vi.fn(async (key: string): Promise<void> => {
      store.delete(key);
    }),
  };
}

function createServiceClient(): IServiceClient {
  return {
    fetchPedidos: vi.fn(async () => [
      { status: "CONFIRMADO", valorTotal: 120 },
      { status: "ENTREGUE", valorTotal: 80 },
      { status: "PENDENTE", valorTotal: 40 },
    ]),
    fetchMovimentacoes: vi.fn(async () => [
      { tipoMovimentacao: "ENTRADA", quantidade: 12 },
      { tipoMovimentacao: "SAIDA", quantidade: 5 },
      { tipoMovimentacao: "AVARIA", quantidade: 1 },
    ]),
    fetchCaixas: vi.fn(async () => [
      { status: "ABERTO" },
      { status: "FECHADO" },
    ]),
    fetchContasAReceber: vi.fn(async () => [
      { status: "PENDENTE", valorAberto: 100 },
      { status: "VENCIDO", valorAberto: 50 },
      { status: "PAGO", valorAberto: 0 },
    ]),
    fetchRotas: vi.fn(async () => [
      { status: "PLANEJADA" },
      { status: "EM_ANDAMENTO" },
    ]),
    fetchEntregas: vi.fn(async () => [
      { status: "ENTREGUE" },
      { status: "PENDENTE" },
    ]),
  };
}

function createTestApp(serviceClient: IServiceClient, cache: ICacheService) {
  const getDashboardUseCase = new GetDashboardUseCase(serviceClient, cache);
  const exportDashboardUseCase = new ExportDashboardUseCase(getDashboardUseCase);
  const dashboardController = new DashboardController(getDashboardUseCase);
  const exportController = new ExportController(exportDashboardUseCase);
  const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
    req.userRole = "admin";
    next();
  };

  return createApp({
    dashboardRoutes: createDashboardRoutes(dashboardController, exportController, authMiddleware),
  });
}

function binaryParser(res: NodeJS.ReadableStream, callback: (err: Error | null, body?: Buffer) => void) {
  const chunks: Buffer[] = [];
  res.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
  res.on("end", () => callback(null, Buffer.concat(chunks)));
  res.on("error", (err) => callback(err));
}

describe("Dashboard API integration", () => {
  let serviceClient: IServiceClient;
  let cache: ICacheService;
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    serviceClient = createServiceClient();
    cache = createMemoryCache();
    app = createTestApp(serviceClient, cache);
  });

  it("retorna dashboard com filtros e agrega KPIs", async () => {
    const res = await request(app)
      .get("/api/v1/dashboard")
      .query({ unidadeId: "u1", dataInicio: "2026-01-01", dataFim: "2026-01-31" })
      .set("Authorization", "Bearer test-token")
      .expect(200);

    expect(res.body.periodo).toEqual({ inicio: "2026-01-01", fim: "2026-01-31" });
    expect(res.body.unidadeId).toBe("u1");
    expect(res.body.resumo).toMatchObject({
      totalPedidos: 3,
      pedidosConfirmados: 2,
      pedidosPendentes: 1,
      faturamentoTotal: 200,
      ticketMedio: 100,
    });
    expect(res.body.estoque).toMatchObject({ totalMovimentacoes: 3, entradas: 12, saidas: 5, avarias: 1 });
    expect(res.body.financeiro).toMatchObject({ caixasAbertos: 1, contasPendentes: 1, contasVencidas: 1, valorTotalAberto: 150 });
    expect(res.body.logistica).toMatchObject({ totalRotas: 2, totalEntregas: 2, entregasEntregues: 1, entregasPendentes: 1 });

    const expectedArgs = ["u1", "Bearer test-token", "2026-01-01", "2026-01-31"];
    expect(serviceClient.fetchPedidos).toHaveBeenCalledWith(...expectedArgs);
    expect(serviceClient.fetchMovimentacoes).toHaveBeenCalledWith(...expectedArgs);
    expect(cache.set).toHaveBeenCalledWith("dashboard:u1:2026-01-01:2026-01-31", expect.any(Object), 30);
  });

  it("usa cache na segunda chamada com o mesmo filtro", async () => {
    const query = { unidadeId: "u1", dataInicio: "2026-01-01", dataFim: "2026-01-31" };

    await request(app).get("/api/v1/dashboard").query(query).expect(200);
    await request(app).get("/api/v1/dashboard").query(query).expect(200);

    expect(serviceClient.fetchPedidos).toHaveBeenCalledTimes(1);
    expect(serviceClient.fetchMovimentacoes).toHaveBeenCalledTimes(1);
    expect(serviceClient.fetchCaixas).toHaveBeenCalledTimes(1);
    expect(cache.get).toHaveBeenCalledWith("dashboard:u1:2026-01-01:2026-01-31");
  });

  it("exporta CSV com filtros", async () => {
    const res = await request(app)
      .get("/api/v1/dashboard/export/csv")
      .query({ unidadeId: "u1", dataInicio: "2026-01-01", dataFim: "2026-01-31" })
      .set("Authorization", "Bearer test-token")
      .expect(200);

    expect(res.headers["content-type"]).toContain("text/csv");
    expect(res.headers["content-disposition"]).toContain("dashboard.csv");
    expect(res.text).toContain("Secao,Metrica,Valor");
    expect(res.text).toContain("Resumo,Total Pedidos,3");
    expect(serviceClient.fetchPedidos).toHaveBeenCalledWith("u1", "Bearer test-token", "2026-01-01", "2026-01-31");
  });

  it("exporta PDF com corpo nao vazio", async () => {
    const res = await request(app)
      .get("/api/v1/dashboard/export/pdf")
      .query({ unidadeId: "u1" })
      .buffer(true)
      .parse(binaryParser)
      .expect(200);

    expect(res.headers["content-type"]).toContain("application/pdf");
    expect(res.headers["content-disposition"]).toContain("dashboard.pdf");
    expect(Buffer.isBuffer(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(100);
    expect(res.body.subarray(0, 4).toString()).toBe("%PDF");
  });
});
