import type { ServiceHealth } from '../types/health';
import { apiFetch } from './api';

export async function fetchHealthCheck(): Promise<ServiceHealth[]> {
  return apiFetch<ServiceHealth[]>('/api/health-check');
}
