import { logger } from "../logger";

export interface ResilientHttpClientOptions {
  timeoutMs?: number;
  maxRetries?: number;
  retryBaseMs?: number;
  retryJitterRatio?: number;
  fetchFn?: typeof fetch;
}

export interface ResilientHttpRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: RequestInit["body"];
  retryOnStatuses?: number[];
}

export type ResilientHttpResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status?: number; error: Error };

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_RETRY_BASE_MS = 250;
const DEFAULT_RETRY_JITTER_RATIO = 0.2;
const DEFAULT_RETRY_STATUSES = [408, 429, 500, 502, 503, 504];

export class ResilientHttpClient {
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly retryBaseMs: number;
  private readonly retryJitterRatio: number;
  private readonly fetchFn: typeof fetch;

  constructor(options: ResilientHttpClientOptions = {}) {
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.retryBaseMs = options.retryBaseMs ?? DEFAULT_RETRY_BASE_MS;
    this.retryJitterRatio = options.retryJitterRatio ?? DEFAULT_RETRY_JITTER_RATIO;
    this.fetchFn = options.fetchFn ?? fetch;
  }

  async getJson<T>(url: string | URL, options: ResilientHttpRequestOptions = {}): Promise<ResilientHttpResult<T>> {
    return this.requestJson<T>(url, { ...options, method: options.method ?? "GET" });
  }

  async requestJson<T>(url: string | URL, options: ResilientHttpRequestOptions = {}): Promise<ResilientHttpResult<T>> {
    const targetUrl = url.toString();
    const retryStatuses = options.retryOnStatuses ?? DEFAULT_RETRY_STATUSES;
    let lastError: Error | null = null;
    let lastStatus: number | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.fetchFn(targetUrl, {
          method: options.method ?? "GET",
          headers: options.headers,
          body: options.body,
          signal: AbortSignal.timeout(this.timeoutMs),
        });

        if (response.ok) {
          return { ok: true, status: response.status, data: (await response.json()) as T };
        }

        lastStatus = response.status;
        lastError = new Error(`HTTP ${response.status}`);
        if (!retryStatuses.includes(response.status) || attempt === this.maxRetries) {
          logger.warn({ url: targetUrl, status: response.status }, "HTTP request failed");
          return { ok: false, status: response.status, error: lastError };
        }

        logger.warn(
          { url: targetUrl, status: response.status, attempt: attempt + 1, maxRetries: this.maxRetries },
          "HTTP request failed, retrying"
        );
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt === this.maxRetries) {
          logger.warn({ err: lastError, url: targetUrl }, "HTTP request failed after retries");
          return { ok: false, status: lastStatus, error: lastError };
        }

        logger.warn(
          { err: lastError, url: targetUrl, attempt: attempt + 1, maxRetries: this.maxRetries },
          "HTTP request errored, retrying"
        );
      }

      await this.sleep(this.delayForAttempt(attempt));
    }

    return {
      ok: false,
      status: lastStatus,
      error: lastError ?? new Error("HTTP request failed"),
    };
  }

  private delayForAttempt(attempt: number): number {
    const baseDelay = this.retryBaseMs * 2 ** attempt;
    if (this.retryJitterRatio <= 0) return baseDelay;

    const jitter = baseDelay * this.retryJitterRatio * Math.random();
    return Math.round(baseDelay + jitter);
  }

  private sleep(ms: number): Promise<void> {
    if (ms <= 0) return Promise.resolve();
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
