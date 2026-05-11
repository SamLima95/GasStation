import { describe, expect, it, vi } from "vitest";
import { ResilientHttpClient } from "./resilient-http-client";

function jsonResponse(body: unknown, init: { ok: boolean; status: number }): Response {
  return {
    ok: init.ok,
    status: init.status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe("ResilientHttpClient", () => {
  it("retorna JSON quando a resposta e ok", async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({ ok: true }, { ok: true, status: 200 }));
    const client = new ResilientHttpClient({ fetchFn, retryBaseMs: 0, retryJitterRatio: 0 });

    const result = await client.getJson<{ ok: boolean }>("http://service.local/items");

    expect(result).toEqual({ ok: true, status: 200, data: { ok: true } });
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("retenta erro de rede e retorna sucesso posterior", async () => {
    const fetchFn = vi
      .fn()
      .mockRejectedValueOnce(new Error("ECONNRESET"))
      .mockResolvedValueOnce(jsonResponse([{ id: "1" }], { ok: true, status: 200 }));
    const client = new ResilientHttpClient({ fetchFn, maxRetries: 1, retryBaseMs: 0, retryJitterRatio: 0 });

    const result = await client.getJson<Array<{ id: string }>>("http://service.local/items");

    expect(result).toEqual({ ok: true, status: 200, data: [{ id: "1" }] });
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it("retenta status 503 e retorna sucesso posterior", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, { ok: false, status: 503 }))
      .mockResolvedValueOnce(jsonResponse(["ok"], { ok: true, status: 200 }));
    const client = new ResilientHttpClient({ fetchFn, maxRetries: 1, retryBaseMs: 0, retryJitterRatio: 0 });

    const result = await client.getJson<string[]>("http://service.local/items");

    expect(result).toEqual({ ok: true, status: 200, data: ["ok"] });
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it("nao retenta status nao retryable", async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({}, { ok: false, status: 404 }));
    const client = new ResilientHttpClient({ fetchFn, maxRetries: 3, retryBaseMs: 0, retryJitterRatio: 0 });

    const result = await client.getJson("http://service.local/items");

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(404);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("inclui timeout signal na requisicao", async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse([], { ok: true, status: 200 }));
    const client = new ResilientHttpClient({ fetchFn, timeoutMs: 1234 });

    await client.getJson("http://service.local/items", { headers: { authorization: "Bearer token" } });

    const [, options] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(options.signal).toBeDefined();
    expect(options.headers).toEqual({ authorization: "Bearer token" });
  });
});
