import { z } from "zod";
export const rotaResponseDtoSchema = z.object({
  id: z.string(), unidadeId: z.string(), entregadorId: z.string(),
  veiculoId: z.string(), dataRota: z.string(), status: z.string(),
});
export type RotaResponseDto = z.infer<typeof rotaResponseDtoSchema>;
