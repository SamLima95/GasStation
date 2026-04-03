import { z } from "zod";

export const dashboardFilterSchema = z.object({
  unidadeId: z.string().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
});

export type DashboardFilterDto = z.infer<typeof dashboardFilterSchema>;

export interface KpiResumoDto {
  totalPedidos: number;
  pedidosConfirmados: number;
  pedidosPendentes: number;
  pedidosCancelados: number;
  faturamentoTotal: number;
  ticketMedio: number;
}

export interface KpiEstoqueDto {
  totalMovimentacoes: number;
  entradas: number;
  saidas: number;
  retornos: number;
  avarias: number;
}

export interface KpiFinanceiroDto {
  caixasAbertos: number;
  caixasFechados: number;
  contasPendentes: number;
  contasPagas: number;
  contasVencidas: number;
  valorTotalAberto: number;
}

export interface KpiLogisticaDto {
  totalRotas: number;
  rotasPlanejadas: number;
  rotasEmAndamento: number;
  rotasFinalizadas: number;
  totalEntregas: number;
  entregasEntregues: number;
  entregasPendentes: number;
}

export interface DashboardDto {
  periodo: { inicio: string | null; fim: string | null };
  unidadeId: string | null;
  resumo: KpiResumoDto;
  estoque: KpiEstoqueDto;
  financeiro: KpiFinanceiroDto;
  logistica: KpiLogisticaDto;
  geradoEm: string;
}
