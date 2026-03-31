import { z } from "zod";

export const contaAReceberResponseDtoSchema = z.object({
  id: z.string(),
  pedidoId: z.string(),
  clienteId: z.string(),
  caixaId: z.string().nullable(),
  valorOriginal: z.number(),
  valorAberto: z.number(),
  status: z.string(),
  vencimento: z.string(),
  createdAt: z.string(),
});

export type ContaAReceberResponseDto = z.infer<typeof contaAReceberResponseDtoSchema>;
