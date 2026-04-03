import type { ContaAReceber } from "../../domain/entities/conta-a-receber.entity";

export interface IContaAReceberRepository {
  save(conta: ContaAReceber): Promise<void>;
  findById(id: string): Promise<ContaAReceber | null>;
  findByClienteId(clienteId: string): Promise<ContaAReceber[]>;
  findByCaixaUnidadeId(unidadeId: string): Promise<ContaAReceber[]>;
  findAll(): Promise<ContaAReceber[]>;
  update(conta: ContaAReceber): Promise<void>;
}
