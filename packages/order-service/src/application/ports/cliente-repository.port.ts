import type { Cliente } from "../../domain/entities/cliente.entity";

export interface IClienteRepository {
  save(cliente: Cliente): Promise<void>;
  findById(id: string): Promise<Cliente | null>;
  findByDocumento(documento: string): Promise<Cliente | null>;
  findByUnidadeId(unidadeId: string): Promise<Cliente[]>;
  findAll(): Promise<Cliente[]>;
  updateSaldoDevedor(id: string, saldoDevedor: number): Promise<void>;
}
