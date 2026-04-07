export interface AuditLog {
  id: string;
  servico: string;
  entidade: string;
  entidadeId: string;
  acao: string;
  usuarioId: string;
  unidadeId: string;
  dados: any;
  createdAt: string;
}

export interface AuditFilter {
  servico?: string;
  entidade?: string;
  acao?: string;
  usuarioId?: string;
  unidadeId?: string;
  dataInicio?: string;
  dataFim?: string;
}
