/**
 * Port para otimização de rotas (RN22).
 * Interface apenas — implementação futura via adapter Google Maps/Fleet.
 */
import type { Entrega } from "../../domain/entities/entrega.entity";
export interface IRouteOptimizer {
  optimize(entregas: Entrega[]): Promise<Entrega[]>;
}
