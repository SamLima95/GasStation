import { logger, ResilientHttpClient } from "@lframework/shared";
import type { IServiceClient } from "../../../application/ports/service-client.port";

/**
 * Adapter que consulta os outros microsserviços via HTTP (service-to-service).
 * Usa fetch nativo do Node 18+.
 */
export class InternalServiceClientAdapter implements IServiceClient {
  private readonly httpClient: ResilientHttpClient;

  constructor(
    private readonly serviceUrls: {
      order: string;
      stock: string;
      financial: string;
      logistics: string;
    },
    httpClient?: ResilientHttpClient
  ) {
    this.httpClient = httpClient ?? new ResilientHttpClient({ timeoutMs: 5000, maxRetries: 2 });
  }

  async fetchPedidos(unidadeId?: string, authHeader?: string, dataInicio?: string, dataFim?: string): Promise<Array<{ status: string; valorTotal: number }>> {
    return this.fetchJson(this.serviceUrls.order, "/api/v1/pedidos", unidadeId, authHeader, dataInicio, dataFim);
  }

  async fetchMovimentacoes(unidadeId?: string, authHeader?: string, dataInicio?: string, dataFim?: string): Promise<Array<{ tipoMovimentacao: string; quantidade: number }>> {
    return this.fetchJson(this.serviceUrls.stock, "/api/v1/movimentacoes", unidadeId, authHeader, dataInicio, dataFim);
  }

  async fetchCaixas(unidadeId?: string, authHeader?: string, dataInicio?: string, dataFim?: string): Promise<Array<{ status: string }>> {
    return this.fetchJson(this.serviceUrls.financial, "/api/v1/caixas", unidadeId, authHeader, dataInicio, dataFim);
  }

  async fetchContasAReceber(unidadeId?: string, authHeader?: string, dataInicio?: string, dataFim?: string): Promise<Array<{ status: string; valorAberto: number }>> {
    return this.fetchJson(this.serviceUrls.financial, "/api/v1/contas-a-receber", unidadeId, authHeader, dataInicio, dataFim);
  }

  async fetchRotas(unidadeId?: string, authHeader?: string, dataInicio?: string, dataFim?: string): Promise<Array<{ status: string }>> {
    return this.fetchJson(this.serviceUrls.logistics, "/api/v1/rotas", unidadeId, authHeader, dataInicio, dataFim);
  }

  async fetchEntregas(unidadeId?: string, authHeader?: string, dataInicio?: string, dataFim?: string): Promise<Array<{ status: string }>> {
    return this.fetchJson(this.serviceUrls.logistics, "/api/v1/entregas", unidadeId, authHeader, dataInicio, dataFim);
  }

  private async fetchJson<T>(baseUrl: string, path: string, unidadeId?: string, authHeader?: string, dataInicio?: string, dataFim?: string): Promise<T[]> {
    const url = new URL(path, baseUrl);
    if (unidadeId) url.searchParams.set("unidadeId", unidadeId);
    if (dataInicio) url.searchParams.set("dataInicio", dataInicio);
    if (dataFim) url.searchParams.set("dataFim", dataFim);

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (authHeader) headers["authorization"] = authHeader;

    const result = await this.httpClient.getJson<T[]>(url, { headers });
    if (!result.ok) {
      logger.warn(
        { err: result.error, url: url.toString(), status: result.status },
        "Erro ao consultar serviço interno — retornando vazio"
      );
      return [];
    }

    return result.data;
  }
}
