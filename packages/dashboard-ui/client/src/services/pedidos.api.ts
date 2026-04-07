import type { Pedido } from '../types/pedidos';
import { apiFetch } from './api';

export async function fetchPedidos(): Promise<Pedido[]> {
  return apiFetch<Pedido[]>('/api/pedidos');
}

export async function createPedido(data: Omit<Pedido, 'id' | 'dataPedido'>): Promise<Pedido> {
  return apiFetch<Pedido>('/api/pedidos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function confirmPedido(id: string): Promise<Pedido> {
  return apiFetch<Pedido>(`/api/pedidos/${id}/confirmar`, {
    method: 'PATCH',
  });
}
