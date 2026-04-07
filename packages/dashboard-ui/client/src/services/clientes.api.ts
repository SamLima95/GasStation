import type { Cliente } from '../types/clientes';
import { apiFetch } from './api';

export async function fetchClientes(): Promise<Cliente[]> {
  return apiFetch<Cliente[]>('/api/clientes');
}

export async function createCliente(data: Omit<Cliente, 'id' | 'createdAt'>): Promise<Cliente> {
  return apiFetch<Cliente>('/api/clientes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
