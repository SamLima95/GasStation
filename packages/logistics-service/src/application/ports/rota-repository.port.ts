import type { Rota } from "../../domain/entities/rota.entity";
import type { StatusRota } from "../../domain/types";
export interface IRotaRepository {
  save(rota: Rota): Promise<void>;
  findById(id: string): Promise<Rota | null>;
  findByUnidadeId(unidadeId: string): Promise<Rota[]>;
  findAll(): Promise<Rota[]>;
  updateStatus(id: string, status: StatusRota): Promise<void>;
}
