import type { DashboardData, DashboardFilter } from '../types/dashboard';
import { apiFetch } from './api';

function buildQuery(filter?: DashboardFilter): string {
  if (!filter) return '';
  const params = new URLSearchParams();
  if (filter.unidadeId) params.set('unidadeId', filter.unidadeId);
  if (filter.dataInicio) params.set('dataInicio', filter.dataInicio);
  if (filter.dataFim) params.set('dataFim', filter.dataFim);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function fetchDashboard(filter?: DashboardFilter): Promise<DashboardData> {
  return apiFetch<DashboardData>(`/api/v1/dashboard${buildQuery(filter)}`);
}

export async function exportCsv(filter?: DashboardFilter): Promise<Response> {
  return apiFetch<Response>(`/api/v1/dashboard/export/csv${buildQuery(filter)}`);
}

export async function exportPdf(filter?: DashboardFilter): Promise<Response> {
  return apiFetch<Response>(`/api/v1/dashboard/export/pdf${buildQuery(filter)}`);
}
