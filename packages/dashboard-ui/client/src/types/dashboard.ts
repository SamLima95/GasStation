export interface KpiResumo {
  totalPedidos: number;
  pedidosConfirmados: number;
  pedidosPendentes: number;
  pedidosCancelados: number;
  faturamentoTotal: number;
  ticketMedio: number;
}

export interface KpiEstoque {
  totalMovimentacoes: number;
  entradas: number;
  saidas: number;
  retornos: number;
  avarias: number;
}

export interface KpiFinanceiro {
  caixasAbertos: number;
  caixasFechados: number;
  contasPendentes: number;
  contasPagas: number;
  contasVencidas: number;
  valorTotalAberto: number;
}

export interface KpiLogistica {
  totalRotas: number;
  rotasPlanejadas: number;
  rotasEmAndamento: number;
  rotasFinalizadas: number;
  totalEntregas: number;
  entregasEntregues: number;
  entregasPendentes: number;
}

export interface DashboardData {
  periodo: {
    inicio: string;
    fim: string;
  };
  unidadeId: string | null;
  resumo: KpiResumo;
  estoque: KpiEstoque;
  financeiro: KpiFinanceiro;
  logistica: KpiLogistica;
  geradoEm: string;
}

export interface DashboardFilter {
  unidadeId?: string;
  dataInicio?: string;
  dataFim?: string;
}
