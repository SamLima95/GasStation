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

  async fetchPedidos(unidadeId?: string): Promise<Array<{ status: string; valorTotal: number }>> {
    return this.fetchJson(this.serviceUrls.order, "/api/v1/pedidos", unidadeId);
  }

  async fetchMovimentacoes(unidadeId?: string): Promise<Array<{ tipoMovimentacao: string; quantidade: number }>> {
    return this.fetchJson(this.serviceUrls.stock, "/api/v1/movimentacoes", unidadeId);
  }

  async fetchCaixas(unidadeId?: string): Promise<Array<{ status: string }>> {
    return this.fetchJson(this.serviceUrls.financial, "/api/v1/caixas", unidadeId);
  }

  async fetchContasAReceber(unidadeId?: string): Promise<Array<{ status: string; valorAberto: number }>> {
    return this.fetchJson(this.serviceUrls.financial, "/api/v1/contas-a-receber", unidadeId);
  }

  async fetchRotas(unidadeId?: string): Promise<Array<{ status: string }>> {
    return this.fetchJson(this.serviceUrls.logistics, "/api/v1/rotas", unidadeId);
  }

  async fetchEntregas(unidadeId?: string): Promise<Array<{ status: string }>> {
    return this.fetchJson(this.serviceUrls.logistics, "/api/v1/entregas", unidadeId);
  }

  private async fetchJson<T>(baseUrl: string, path: string, unidadeId?: string): Promise<T[]> {
    const url = new URL(path, baseUrl);
    if (unidadeId) url.searchParams.set("unidadeId", unidadeId);

    try {
      const res = await fetch(url.toString(), {
        headers: { "Content-Type": "application/json" },
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
