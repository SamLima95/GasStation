import type { Entrega } from "../../domain/entities/entrega.entity";
import type { StatusEntrega } from "../../domain/types";
export interface IEntregaRepository {
  save(entrega: Entrega): Promise<void>;
  findById(id: string): Promise<Entrega | null>;
  findByRotaId(rotaId: string): Promise<Entrega[]>;
  findByStatus(status: StatusEntrega): Promise<Entrega[]>;
  findByRotaUnidadeId(unidadeId: string): Promise<Entrega[]>;
  findAll(): Promise<Entrega[]>;
  update(entrega: Entrega): Promise<void>;
}
