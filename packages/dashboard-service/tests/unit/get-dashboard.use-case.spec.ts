import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetDashboardUseCase } from "../../src/application/use-cases/get-dashboard.use-case";
import type { IServiceClient } from "../../src/application/ports/service-client.port";
import type { ICacheService } from "@lframework/shared";
import type { DashboardDto } from "../../src/application/dtos/dashboard.dto";

describe("GetDashboardUseCase", () => {
  let serviceClient: IServiceClient;
  let cache: ICacheService;

  const pedidos = [
    { status: "CONFIRMADO", valorTotal: 100 },
    { status: "PENDENTE", valorTotal: 50 },
    { status: "CANCELADO", valorTotal: 30 },
    { status: "ENTREGUE", valorTotal: 200 },
  ];
  const movimentacoes = [
    { tipoMovimentacao: "ENTRADA", quantidade: 10 },
    { tipoMovimentacao: "SAIDA", quantidade: 5 },
    { tipoMovimentacao: "RETORNO", quantidade: 3 },
    { tipoMovimentacao: "AVARIA", quantidade: 1 },
  ];
  const caixas = [{ status: "ABERTO" }, { status: "FECHADO" }, { status: "FECHADO" }];
  const contas = [
    { status: "PENDENTE", valorAberto: 100 },
    { status: "PAGO", valorAberto: 0 },
    { status: "VENCIDO", valorAberto: 50 },
  ];
  const rotas = [{ status: "PLANEJADA" }, { status: "EM_ANDAMENTO" }, { status: "FINALIZADA" }];
  const entregas = [{ status: "ENTREGUE" }, { status: "PENDENTE" }, { status: "PENDENTE" }];

  beforeEach(() => {
    serviceClient = {
      fetchPedidos: vi.fn().mockResolvedValue(pedidos),
      fetchMovimentacoes: vi.fn().mockResolvedValue(movimentacoes),
      fetchCaixas: vi.fn().mockResolvedValue(caixas),
      fetchContasAReceber: vi.fn().mockResolvedValue(contas),
      fetchRotas: vi.fn().mockResolvedValue(rotas),
      fetchEntregas: vi.fn().mockResolvedValue(entregas),
    };
    cache = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    };
  });

  it("deve agregar KPIs corretamente a partir dos dados dos servicos", async () => {
    const useCase = new GetDashboardUseCase(serviceClient, cache);
    const result = await useCase.execute({});

    expect(result.resumo).toEqual({
      totalPedidos: 4,
      pedidosConfirmados: 2,
      pedidosPendentes: 1,
      pedidosCancelados: 1,
      faturamentoTotal: 300,
      ticketMedio: 150,
    });
    expect(result.estoque).toEqual({
      totalMovimentacoes: 4,
      entradas: 10,
      saidas: 5,
      retornos: 3,
      avarias: 1,
    });
    expect(result.financeiro).toEqual({
      caixasAbertos: 1,
      caixasFechados: 2,
      contasPendentes: 1,
      contasPagas: 1,
      contasVencidas: 1,
      valorTotalAberto: 150,
    });
    expect(result.logistica).toEqual({
      totalRotas: 3,
      rotasPlanejadas: 1,
      rotasEmAndamento: 1,
      rotasFinalizadas: 1,
      totalEntregas: 3,
      entregasEntregues: 1,
      entregasPendentes: 2,
    });
  });

  it("deve retornar dados do cache quando cache hit", async () => {
    const cached: DashboardDto = {
      periodo: { inicio: null, fim: null },
      unidadeId: null,
      resumo: { totalPedidos: 0, pedidosConfirmados: 0, pedidosPendentes: 0, pedidosCancelados: 0, faturamentoTotal: 0, ticketMedio: 0 },
      estoque: { totalMovimentacoes: 0, entradas: 0, saidas: 0, retornos: 0, avarias: 0 },
      financeiro: { caixasAbertos: 0, caixasFechados: 0, contasPendentes: 0, contasPagas: 0, contasVencidas: 0, valorTotalAberto: 0 },
      logistica: { totalRotas: 0, rotasPlanejadas: 0, rotasEmAndamento: 0, rotasFinalizadas: 0, totalEntregas: 0, entregasEntregues: 0, entregasPendentes: 0 },
      geradoEm: "2025-01-01T00:00:00.000Z",
    };
    vi.mocked(cache.get).mockResolvedValue(cached);

    const useCase = new GetDashboardUseCase(serviceClient, cache);
    const result = await useCase.execute({});

    expect(result).toEqual(cached);
    expect(serviceClient.fetchPedidos).not.toHaveBeenCalled();
    expect(serviceClient.fetchMovimentacoes).not.toHaveBeenCalled();
  });

  it("deve gravar resultado no cache apos computacao", async () => {
    const useCase = new GetDashboardUseCase(serviceClient, cache);
    const result = await useCase.execute({});

    expect(cache.set).toHaveBeenCalledWith("dashboard:all::", result, 30);
  });

  it("deve retornar zeros quando servicos retornam arrays vazios", async () => {
    serviceClient = {
      fetchPedidos: vi.fn().mockResolvedValue([]),
      fetchMovimentacoes: vi.fn().mockResolvedValue([]),
      fetchCaixas: vi.fn().mockResolvedValue([]),
      fetchContasAReceber: vi.fn().mockResolvedValue([]),
      fetchRotas: vi.fn().mockResolvedValue([]),
      fetchEntregas: vi.fn().mockResolvedValue([]),
    };

    const useCase = new GetDashboardUseCase(serviceClient, cache);
    const result = await useCase.execute({});

    expect(result.resumo.totalPedidos).toBe(0);
    expect(result.resumo.faturamentoTotal).toBe(0);
    expect(result.resumo.ticketMedio).toBe(0);
    expect(result.estoque.totalMovimentacoes).toBe(0);
    expect(result.financeiro.valorTotalAberto).toBe(0);
    expect(result.logistica.totalRotas).toBe(0);
  });

  it("deve repassar unidadeId, authHeader, dataInicio e dataFim para cada fetch", async () => {
    const useCase = new GetDashboardUseCase(serviceClient, cache);
    await useCase.execute(
      { unidadeId: "u1", dataInicio: "2025-01-01", dataFim: "2025-12-31" },
      "Bearer tok123"
    );

    const expected = ["u1", "Bearer tok123", "2025-01-01", "2025-12-31"];
    expect(serviceClient.fetchPedidos).toHaveBeenCalledWith(...expected);
    expect(serviceClient.fetchMovimentacoes).toHaveBeenCalledWith(...expected);
    expect(serviceClient.fetchCaixas).toHaveBeenCalledWith(...expected);
    expect(serviceClient.fetchContasAReceber).toHaveBeenCalledWith(...expected);
    expect(serviceClient.fetchRotas).toHaveBeenCalledWith(...expected);
    expect(serviceClient.fetchEntregas).toHaveBeenCalledWith(...expected);
  });

  it("deve usar cache key com unidadeId e periodo", async () => {
    const useCase = new GetDashboardUseCase(serviceClient, cache);
    await useCase.execute({ unidadeId: "u1", dataInicio: "2025-01-01", dataFim: "2025-12-31" });

    expect(cache.get).toHaveBeenCalledWith("dashboard:u1:2025-01-01:2025-12-31");
  });

  it("deve incluir periodo e unidadeId no resultado", async () => {
    const useCase = new GetDashboardUseCase(serviceClient, cache);
    const result = await useCase.execute({ unidadeId: "u1", dataInicio: "2025-01-01", dataFim: "2025-12-31" });

    expect(result.periodo).toEqual({ inicio: "2025-01-01", fim: "2025-12-31" });
    expect(result.unidadeId).toBe("u1");
    expect(result.geradoEm).toBeDefined();
  });
});
