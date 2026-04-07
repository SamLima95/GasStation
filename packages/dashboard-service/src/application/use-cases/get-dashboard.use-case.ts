import type { IServiceClient } from "../ports/service-client.port";
import type { ICacheService } from "@lframework/shared";
import type { DashboardDto, DashboardFilterDto, KpiResumoDto, KpiEstoqueDto, KpiFinanceiroDto, KpiLogisticaDto } from "../dtos/dashboard.dto";

const CACHE_TTL = 30; // 30 segundos

export class GetDashboardUseCase {
  constructor(
    private readonly serviceClient: IServiceClient,
    private readonly cache: ICacheService
  ) {}

  async execute(filter: DashboardFilterDto, authHeader?: string): Promise<DashboardDto> {
    const cacheKey = `dashboard:${filter.unidadeId ?? "all"}:${filter.dataInicio ?? ""}:${filter.dataFim ?? ""}`;
    const cached = await this.cache.get<DashboardDto>(cacheKey);
    if (cached) return cached;

    const [pedidos, movimentacoes, caixas, contas, rotas, entregas] = await Promise.all([
      this.serviceClient.fetchPedidos(filter.unidadeId, authHeader, filter.dataInicio, filter.dataFim),
      this.serviceClient.fetchMovimentacoes(filter.unidadeId, authHeader, filter.dataInicio, filter.dataFim),
      this.serviceClient.fetchCaixas(filter.unidadeId, authHeader, filter.dataInicio, filter.dataFim),
      this.serviceClient.fetchContasAReceber(filter.unidadeId, authHeader, filter.dataInicio, filter.dataFim),
      this.serviceClient.fetchRotas(filter.unidadeId, authHeader, filter.dataInicio, filter.dataFim),
      this.serviceClient.fetchEntregas(filter.unidadeId, authHeader, filter.dataInicio, filter.dataFim),
    ]);

    const resumo = this.calcResumo(pedidos);
    const estoque = this.calcEstoque(movimentacoes);
    const financeiro = this.calcFinanceiro(caixas, contas);
    const logistica = this.calcLogistica(rotas, entregas);

    const dashboard: DashboardDto = {
      periodo: { inicio: filter.dataInicio ?? null, fim: filter.dataFim ?? null },
      unidadeId: filter.unidadeId ?? null,
      resumo,
      estoque,
      financeiro,
      logistica,
      geradoEm: new Date().toISOString(),
    };

    await this.cache.set(cacheKey, dashboard, CACHE_TTL);
    return dashboard;
  }

  private calcResumo(pedidos: Array<{ status: string; valorTotal: number }>): KpiResumoDto {
    const confirmados = pedidos.filter((p) => p.status === "CONFIRMADO" || p.status === "ENTREGUE");
    const faturamentoTotal = confirmados.reduce((sum, p) => sum + p.valorTotal, 0);
    return {
      totalPedidos: pedidos.length,
      pedidosConfirmados: confirmados.length,
      pedidosPendentes: pedidos.filter((p) => p.status === "PENDENTE").length,
      pedidosCancelados: pedidos.filter((p) => p.status === "CANCELADO").length,
      faturamentoTotal: Math.round(faturamentoTotal * 100) / 100,
      ticketMedio: confirmados.length > 0 ? Math.round((faturamentoTotal / confirmados.length) * 100) / 100 : 0,
    };
  }

  private calcEstoque(movimentacoes: Array<{ tipoMovimentacao: string; quantidade: number }>): KpiEstoqueDto {
    return {
      totalMovimentacoes: movimentacoes.length,
      entradas: movimentacoes.filter((m) => m.tipoMovimentacao === "ENTRADA").reduce((s, m) => s + m.quantidade, 0),
      saidas: movimentacoes.filter((m) => m.tipoMovimentacao === "SAIDA").reduce((s, m) => s + m.quantidade, 0),
      retornos: movimentacoes.filter((m) => m.tipoMovimentacao === "RETORNO").reduce((s, m) => s + m.quantidade, 0),
      avarias: movimentacoes.filter((m) => m.tipoMovimentacao === "AVARIA").reduce((s, m) => s + m.quantidade, 0),
    };
  }

  private calcFinanceiro(caixas: Array<{ status: string }>, contas: Array<{ status: string; valorAberto: number }>): KpiFinanceiroDto {
    return {
      caixasAbertos: caixas.filter((c) => c.status === "ABERTO").length,
      caixasFechados: caixas.filter((c) => c.status === "FECHADO").length,
      contasPendentes: contas.filter((c) => c.status === "PENDENTE").length,
      contasPagas: contas.filter((c) => c.status === "PAGO").length,
      contasVencidas: contas.filter((c) => c.status === "VENCIDO").length,
      valorTotalAberto: Math.round(contas.reduce((s, c) => s + c.valorAberto, 0) * 100) / 100,
    };
  }

  private calcLogistica(rotas: Array<{ status: string }>, entregas: Array<{ status: string }>): KpiLogisticaDto {
    return {
      totalRotas: rotas.length,
      rotasPlanejadas: rotas.filter((r) => r.status === "PLANEJADA").length,
      rotasEmAndamento: rotas.filter((r) => r.status === "EM_ANDAMENTO").length,
      rotasFinalizadas: rotas.filter((r) => r.status === "FINALIZADA").length,
      totalEntregas: entregas.length,
      entregasEntregues: entregas.filter((e) => e.status === "ENTREGUE").length,
      entregasPendentes: entregas.filter((e) => e.status === "PENDENTE").length,
    };
  }
}
