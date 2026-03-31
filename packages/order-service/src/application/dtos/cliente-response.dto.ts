import { z } from "zod";

export const clienteResponseDtoSchema = z.object({
  id: z.string(),
  nome: z.string(),
  documento: z.string(),
  limiteCredito: z.number(),
  saldoDevedor: z.number(),
  unidadeId: z.string(),
  createdAt: z.string(),
});

export type ClienteResponseDto = z.infer<typeof clienteResponseDtoSchema>;
