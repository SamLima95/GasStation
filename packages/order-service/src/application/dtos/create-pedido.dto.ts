import { z } from "zod";

const TIPOS_PAGAMENTO = ["A_VISTA", "FIADO", "CARTAO", "PIX"] as const;

export const createItemPedidoSchema = z.object({
  vasilhameId: z.string().min(1, "vasilhameId is required").max(64),
  quantidade: z.coerce.number().int("quantidade must be an integer").positive("quantidade must be positive"),
  precoUnitario: z.coerce.number().finite().positive("precoUnitario must be positive"),
});

export const createPedidoSchema = z.object({
  clienteId: z.string().min(1, "clienteId is required").max(64),
  unidadeId: z.string().min(1, "unidadeId is required").max(64),
  tipoPagamento: z.enum(TIPOS_PAGAMENTO),
  itens: z.array(createItemPedidoSchema).min(1, "At least one item is required"),
  dataEntregaPrevista: z.string().datetime().optional().nullable().default(null),
});

export type CreatePedidoDto = z.infer<typeof createPedidoSchema>;
