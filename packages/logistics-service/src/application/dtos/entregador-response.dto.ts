import { z } from "zod";
export const entregadorResponseDtoSchema = z.object({
  id: z.string(), nome: z.string(), documento: z.string(), ativo: z.boolean(), unidadeId: z.string(),
});
export type EntregadorResponseDto = z.infer<typeof entregadorResponseDtoSchema>;
