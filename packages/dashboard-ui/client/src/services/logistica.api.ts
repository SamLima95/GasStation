import type { Rota, Entrega, Entregador, Veiculo } from '../types/logistica';
import { apiFetch } from './api';

export async function fetchRotas(): Promise<Rota[]> {
  return apiFetch<Rota[]>('/api/rotas');
}

export async function createRota(data: Omit<Rota, 'id'>): Promise<Rota> {
  return apiFetch<Rota>('/api/rotas', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchEntregas(): Promise<Entrega[]> {
  return apiFetch<Entrega[]>('/api/entregas');
}

export async function assignEntrega(id: string, rotaId: string): Promise<Entrega> {
  return apiFetch<Entrega>(`/api/entregas/${id}/atribuir`, {
    method: 'PATCH',
    body: JSON.stringify({ rotaId }),
  });
}

export async function confirmEntrega(id: string): Promise<Entrega> {
  return apiFetch<Entrega>(`/api/entregas/${id}/confirmar`, {
    method: 'PATCH',
  });
}

export async function fetchEntregadores(): Promise<Entregador[]> {
  return apiFetch<Entregador[]>('/api/entregadores');
}

export async function createEntregador(data: Omit<Entregador, 'id'>): Promise<Entregador> {
  return apiFetch<Entregador>('/api/entregadores', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchVeiculos(): Promise<Veiculo[]> {
  return apiFetch<Veiculo[]>('/api/veiculos');
}

export async function createVeiculo(data: Omit<Veiculo, 'id'>): Promise<Veiculo> {
  return apiFetch<Veiculo>('/api/veiculos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
