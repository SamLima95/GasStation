export interface ServiceHealth {
  name: string;
  key: string;
  url: string;
  status: 'ok' | 'down';
  responseTimeMs: number;
  detail?: string;
}
