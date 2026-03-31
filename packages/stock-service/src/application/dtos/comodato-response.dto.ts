import { z } from "zod";

export const comodatoResponseDtoSchema = z.object({
  id: z.string(),
  clienteId: z.string(),
  unidadeId: z.string(),
  vasilhameId: z.string(),
  saldoComodato: z.number(),
  atualizadoEm: z.string(),
});

export type ComodatoResponseDto = z.infer<typeof comodatoResponseDtoSchema>;
