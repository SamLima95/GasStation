import { logger } from "@lframework/shared";
import type { IServiceClient } from "../../../application/ports/service-client.port";

/**
 * Adapter que consulta os outros microsserviços via HTTP (service-to-service).
 * Usa fetch nativo do Node 18+.
 */
export class InternalServiceClientAdapter implements IServiceClient {
  constructor(private readonly serviceUrls: {
    order: string;
    stock: string;
    financial: string;
    logistics: string;
  }) {}

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

    try {
      const res = await fetch(url.toString(), {
        headers,
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        logger.warn({ url: url.toString(), status: res.status }, "Falha ao consultar serviço interno");
        return [];
      }
      return (await res.json()) as T[];
    } catch (err) {
      logger.warn({ err, url: url.toString() }, "Erro ao consultar serviço interno — retornando vazio");
      return [];
    }
  }
}
