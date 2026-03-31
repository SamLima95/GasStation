import type { Pedido } from "../../domain/entities/pedido.entity";
import type { StatusPedido } from "../../domain/types";

export interface IPedidoRepository {
  save(pedido: Pedido): Promise<void>;
  findById(id: string): Promise<Pedido | null>;
  findByClienteId(clienteId: string): Promise<Pedido[]>;
  findByUnidadeId(unidadeId: string): Promise<Pedido[]>;
  findAll(): Promise<Pedido[]>;
  updateStatus(id: string, status: StatusPedido): Promise<void>;
}
