import type { ItemPedido } from "../../domain/entities/item-pedido.entity";

export interface IItemPedidoRepository {
  saveMany(itens: ItemPedido[]): Promise<void>;
  findByPedidoId(pedidoId: string): Promise<ItemPedido[]>;
}
