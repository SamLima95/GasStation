import { z } from "zod";

export const createContaAReceberSchema = z.object({
  pedidoId: z.string().min(1, "pedidoId is required").max(64),
  clienteId: z.string().min(1, "clienteId is required").max(64),
  valorOriginal: z.coerce.number().finite().positive("valorOriginal must be positive"),
  vencimento: z.string().datetime(),
});

export type CreateContaAReceberDto = z.infer<typeof createContaAReceberSchema>;
