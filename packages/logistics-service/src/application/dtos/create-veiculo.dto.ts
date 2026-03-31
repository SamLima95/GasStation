import { z } from "zod";
export const createVeiculoSchema = z.object({
  placa: z.string().min(1).max(10).trim(), modelo: z.string().min(1).max(200).trim(), unidadeId: z.string().min(1).max(64),
});
export type CreateVeiculoDto = z.infer<typeof createVeiculoSchema>;
