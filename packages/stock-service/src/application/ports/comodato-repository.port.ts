import type { Comodato } from "../../domain/entities/comodato.entity";

export interface IComodatoRepository {
  save(comodato: Comodato): Promise<void>;
  findById(id: string): Promise<Comodato | null>;
  findByClienteId(clienteId: string): Promise<Comodato[]>;
  upsert(comodato: Comodato): Promise<void>;
  findAll(): Promise<Comodato[]>;
}
