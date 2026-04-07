export interface ItemPedido {
  id: string;
  vasilhameId: string;
  quantidade: number;
  precoUnitario: number;
}

export interface Pedido {
  id: string;
  clienteId: string;
  unidadeId: string;
  status: 'PENDENTE' | 'CONFIRMADO' | 'ENTREGUE' | 'CANCELADO';
  tipoPagamento: string;
  valorTotal: number;
  dataPedido: string;
  itens: ItemPedido[];
}
