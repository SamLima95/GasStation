import { z } from "zod";

export const itemPedidoResponseDtoSchema = z.object({
  id: z.string(),
  pedidoId: z.string(),
  vasilhameId: z.string(),
  quantidade: z.number(),
  precoUnitario: z.number(),
});

export const pedidoResponseDtoSchema = z.object({
  id: z.string(),
  clienteId: z.string(),
  unidadeId: z.string(),
  status: z.string(),
  tipoPagamento: z.string(),
  valorTotal: z.number(),
  dataPedido: z.string(),
  dataEntregaPrevista: z.string().nullable(),
  itens: z.array(itemPedidoResponseDtoSchema),
});

export type ItemPedidoResponseDto = z.infer<typeof itemPedidoResponseDtoSchema>;
export type PedidoResponseDto = z.infer<typeof pedidoResponseDtoSchema>;
