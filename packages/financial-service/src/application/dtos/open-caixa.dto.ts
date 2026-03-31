import { z } from "zod";

export const openCaixaSchema = z.object({
  unidadeId: z.string().min(1, "unidadeId is required").max(64),
  saldoInicial: z.coerce.number().finite().nonnegative("saldoInicial must be non-negative"),
});

export type OpenCaixaDto = z.infer<typeof openCaixaSchema>;
