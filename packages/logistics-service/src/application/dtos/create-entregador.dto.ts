import { z } from "zod";
export const createEntregadorSchema = z.object({
  nome: z.string().min(1).max(200).trim(), documento: z.string().min(1).max(20).trim(), unidadeId: z.string().min(1).max(64),
});
export type CreateEntregadorDto = z.infer<typeof createEntregadorSchema>;
