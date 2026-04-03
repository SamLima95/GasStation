/**
 * Evento de auditoria compartilhado.
 * Publicado por qualquer serviço; consumido pelo audit-service.
 */
export interface AuditEventPayload {
  /** Serviço de origem (ex.: "identity-service", "order-service") */
  servico: string;
  /** Entidade afetada (ex.: "Pedido", "Caixa", "MovimentacaoEstoque") */
  entidade: string;
  /** ID da entidade afetada */
  entidadeId: string;
  /** Ação realizada (ex.: "CRIACAO", "ATUALIZACAO", "EXCLUSAO", "LOGIN", "CONFIRMACAO") */
  acao: string;
  /** ID do usuário que executou a ação (quando disponível) */
  usuarioId: string | null;
  /** ID da unidade (quando disponível) */
  unidadeId: string | null;
  /** Detalhes da alteração (JSON livre — ex.: campos alterados, valores antigos/novos) */
  detalhes: Record<string, unknown> | null;
  /** Timestamp ISO 8601 */
  occurredAt: string;
}

export const AUDIT_EVENT = "audit.logged";
