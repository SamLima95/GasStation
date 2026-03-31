import { z } from "zod";
export const createRotaSchema = z.object({
  unidadeId: z.string().min(1).max(64), entregadorId: z.string().min(1).max(64),
  veiculoId: z.string().min(1).max(64), dataRota: z.string().datetime(),
});
export type CreateRotaDto = z.infer<typeof createRotaSchema>;
