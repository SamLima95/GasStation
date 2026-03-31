import { z } from "zod";

export const createClienteSchema = z.object({
  nome: z.string().min(1, "nome is required").max(200, "nome too long").trim(),
  documento: z.string().min(1, "documento is required").max(20, "documento too long").trim(),
  limiteCredito: z.coerce.number().finite().nonnegative("limiteCredito must be non-negative"),
  unidadeId: z.string().min(1, "unidadeId is required").max(64),
});

export type CreateClienteDto = z.infer<typeof createClienteSchema>;
