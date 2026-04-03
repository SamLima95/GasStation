import { logger } from "@lframework/shared";
import type { Entrega } from "../../../domain/entities/entrega.entity";
import type { IRouteOptimizer } from "../../../application/ports/route-optimizer.port";

/**
 * Adapter stub para otimização de rotas (RN22).
 * Reordena entregas por pedidoId para demonstrar que a otimização rodou.
 * Substituir por adapter Google Maps/Fleet em produção.
 */
export class StubRouteOptimizerAdapter implements IRouteOptimizer {
  async optimize(entregas: Entrega[]): Promise<Entrega[]> {
    logger.info({ count: entregas.length }, "Otimizando rota (stub)");

    // Simula latência de chamada externa
    await new Promise((r) => setTimeout(r, 100));

    // Ordena por pedidoId como heurística stub (demonstra reordenação)
    const sorted = [...entregas].sort((a, b) => a.pedidoId.localeCompare(b.pedidoId));

    logger.info({ count: sorted.length }, "Rota otimizada (stub) — entregas reordenadas por pedidoId");
    return sorted;
  }
}
