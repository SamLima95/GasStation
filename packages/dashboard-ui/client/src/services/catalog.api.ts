import type { CatalogItem } from '../types/catalog';
import { apiFetch } from './api';

export async function fetchItems(): Promise<CatalogItem[]> {
  return apiFetch<CatalogItem[]>('/api/catalog');
}

export async function createItem(data: Omit<CatalogItem, 'id' | 'createdAt'>): Promise<CatalogItem> {
  return apiFetch<CatalogItem>('/api/catalog', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
