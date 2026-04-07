export interface Caixa {
  id: string;
  unidadeId: string;
  status: 'ABERTO' | 'FECHADO';
  dataAbertura: string;
  dataFechamento?: string;
  saldoInicial: number;
  saldoFinal?: number;
}

export interface ContaAReceber {
  id: string;
  pedidoId: string;
  clienteId: string;
  unidadeId: string;
  status: 'PENDENTE' | 'PAGO' | 'VENCIDO';
  valorAberto: number;
  vencimento: string;
  createdAt: string;
}
