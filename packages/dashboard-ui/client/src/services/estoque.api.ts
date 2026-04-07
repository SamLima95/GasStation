import type { Vasilhame, MovimentacaoEstoque } from '../types/estoque';
import { apiFetch } from './api';

export async function fetchVasilhames(): Promise<Vasilhame[]> {
  return apiFetch<Vasilhame[]>('/api/vasilhames');
}

export async function createVasilhame(data: Omit<Vasilhame, 'id'>): Promise<Vasilhame> {
  return apiFetch<Vasilhame>('/api/vasilhames', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchMovimentacoes(): Promise<MovimentacaoEstoque[]> {
  return apiFetch<MovimentacaoEstoque[]>('/api/movimentacoes');
}

export async function createMovimentacao(data: Omit<MovimentacaoEstoque, 'id' | 'createdAt'>): Promise<MovimentacaoEstoque> {
  return apiFetch<MovimentacaoEstoque>('/api/movimentacoes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
