import type { Unidade } from "../../domain/entities/unidade.entity";

export interface IUnidadeRepository {
  save(unidade: Unidade): Promise<void>;
  findById(id: string): Promise<Unidade | null>;
  findAll(): Promise<Unidade[]>;
}
