import { z } from "zod";

export const caixaResponseDtoSchema = z.object({
  id: z.string(),
  unidadeId: z.string(),
  dataAbertura: z.string(),
  dataFechamento: z.string().nullable(),
  status: z.string(),
  saldoInicial: z.number(),
  saldoFinal: z.number().nullable(),
});

export type CaixaResponseDto = z.infer<typeof caixaResponseDtoSchema>;
