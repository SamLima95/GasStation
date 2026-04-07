import type { LoginResponse } from '../types/auth';
import { apiFetch, setToken, setUser, clearToken } from './api';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.accessToken);
  setUser(data.user);
  return data;
}

export async function register(name: string, email: string, password: string): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  setToken(data.accessToken);
  setUser(data.user);
  return data;
}

export function logout(): void {
  clearToken();
  window.location.href = '/login';
}
