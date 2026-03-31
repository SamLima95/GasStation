import type { Entregador } from "../../domain/entities/entregador.entity";
export interface IEntregadorRepository {
  save(entregador: Entregador): Promise<void>;
  findById(id: string): Promise<Entregador | null>;
  findByUnidadeId(unidadeId: string): Promise<Entregador[]>;
  findAll(): Promise<Entregador[]>;
  update(entregador: Entregador): Promise<void>;
}
