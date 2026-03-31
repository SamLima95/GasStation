/**
 * Tipos canônicos de domínio do order.
 */
export enum StatusPedido {
  PENDENTE = "PENDENTE",
  CONFIRMADO = "CONFIRMADO",
  ENTREGUE = "ENTREGUE",
  CANCELADO = "CANCELADO",
}

export enum TipoPagamento {
  A_VISTA = "A_VISTA",
  FIADO = "FIADO",
  CARTAO = "CARTAO",
  PIX = "PIX",
}
