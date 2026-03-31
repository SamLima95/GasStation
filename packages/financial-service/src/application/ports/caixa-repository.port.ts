import type { Caixa } from "../../domain/entities/caixa.entity";

export interface ICaixaRepository {
  save(caixa: Caixa): Promise<void>;
  findById(id: string): Promise<Caixa | null>;
  findOpenByUnidadeId(unidadeId: string): Promise<Caixa | null>;
  findByUnidadeId(unidadeId: string): Promise<Caixa[]>;
  findAll(): Promise<Caixa[]>;
  update(caixa: Caixa): Promise<void>;
}
