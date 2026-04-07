import type { Caixa, ContaAReceber } from '../types/financeiro';
import { apiFetch } from './api';

export async function fetchCaixas(): Promise<Caixa[]> {
  return apiFetch<Caixa[]>('/api/caixas');
}

export async function openCaixa(data: Pick<Caixa, 'unidadeId' | 'saldoInicial'>): Promise<Caixa> {
  return apiFetch<Caixa>('/api/caixas', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function closeCaixa(id: string): Promise<Caixa> {
  return apiFetch<Caixa>(`/api/caixas/${id}/fechar`, {
    method: 'PATCH',
  });
}

export async function fetchContas(): Promise<ContaAReceber[]> {
  return apiFetch<ContaAReceber[]>('/api/contas-a-receber');
}

export async function pagarConta(id: string, data: { valorPago: number }): Promise<ContaAReceber> {
  return apiFetch<ContaAReceber>(`/api/contas-a-receber/${id}/pagar`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
