import type { AuditLog, AuditFilter } from '../types/auditoria';
import { apiFetch } from './api';

export async function fetchAuditLogs(filter?: AuditFilter): Promise<AuditLog[]> {
  if (!filter) return apiFetch<AuditLog[]>('/api/v1/auditoria');

  const params = new URLSearchParams();
  if (filter.servico) params.set('servico', filter.servico);
  if (filter.entidade) params.set('entidade', filter.entidade);
  if (filter.acao) params.set('acao', filter.acao);
  if (filter.usuarioId) params.set('usuarioId', filter.usuarioId);
  if (filter.unidadeId) params.set('unidadeId', filter.unidadeId);
  if (filter.dataInicio) params.set('dataInicio', filter.dataInicio);
  if (filter.dataFim) params.set('dataFim', filter.dataFim);

  const qs = params.toString();
  return apiFetch<AuditLog[]>(`/api/v1/auditoria${qs ? `?${qs}` : ''}`);
}
