import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ResilientHttpClient } from "@lframework/shared";
import { InternalServiceClientAdapter } from "../../src/adapters/driven/http-client/internal-service-client.adapter";

const SERVICE_URLS = {
  order: "http://localhost:3005",
  stock: "http://localhost:3004",
  financial: "http://localhost:3006",
  logistics: "http://localhost:3007",
};

describe("InternalServiceClientAdapter", () => {
  let adapter: InternalServiceClientAdapter;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    adapter = new InternalServiceClientAdapter(
      SERVICE_URLS,
      new ResilientHttpClient({ fetchFn: fetchMock, maxRetries: 0, retryBaseMs: 0, retryJitterRatio: 0 })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("deve construir URL com unidadeId, dataInicio e dataFim", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });

    await adapter.fetchPedidos("u1", "Bearer tok", "2025-01-01", "2025-12-31");

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/api/v1/pedidos");
    expect(calledUrl).toContain("unidadeId=u1");
    expect(calledUrl).toContain("dataInicio=2025-01-01");
    expect(calledUrl).toContain("dataFim=2025-12-31");
  });

  it("deve omitir params nao fornecidos da URL", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });

    await adapter.fetchPedidos();

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).not.toContain("unidadeId");
    expect(calledUrl).not.toContain("dataInicio");
    expect(calledUrl).not.toContain("dataFim");
  });

  it("deve enviar header de autorizacao quando fornecido", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });

    await adapter.fetchPedidos("u1", "Bearer tok123");

    const calledOptions = fetchMock.mock.calls[0][1] as RequestInit;
    expect((calledOptions.headers as Record<string, string>)["authorization"]).toBe("Bearer tok123");
  });

  it("deve retornar dados JSON em resposta 200", async () => {
    const data = [{ status: "CONFIRMADO", valorTotal: 100 }];
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve(data) });

    const result = await adapter.fetchPedidos();

    expect(result).toEqual(data);
  });

  it("deve retornar array vazio em resposta non-OK", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 });

    const result = await adapter.fetchPedidos();

    expect(result).toEqual([]);
  });

  it("deve retornar array vazio em erro de rede", async () => {
    fetchMock.mockRejectedValue(new Error("Connection refused"));

    const result = await adapter.fetchPedidos();

    expect(result).toEqual([]);
  });

  it("deve usar AbortSignal com timeout", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });

    await adapter.fetchPedidos();

    const calledOptions = fetchMock.mock.calls[0][1] as RequestInit;
    expect(calledOptions.signal).toBeDefined();
  });

  it("deve chamar URLs corretas para cada servico", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });

    await adapter.fetchPedidos();
    expect(fetchMock.mock.calls[0][0]).toContain("localhost:3005/api/v1/pedidos");

    await adapter.fetchMovimentacoes();
    expect(fetchMock.mock.calls[1][0]).toContain("localhost:3004/api/v1/movimentacoes");

    await adapter.fetchCaixas();
    expect(fetchMock.mock.calls[2][0]).toContain("localhost:3006/api/v1/caixas");

    await adapter.fetchContasAReceber();
    expect(fetchMock.mock.calls[3][0]).toContain("localhost:3006/api/v1/contas-a-receber");

    await adapter.fetchRotas();
    expect(fetchMock.mock.calls[4][0]).toContain("localhost:3007/api/v1/rotas");

    await adapter.fetchEntregas();
    expect(fetchMock.mock.calls[5][0]).toContain("localhost:3007/api/v1/entregas");
  });
});
