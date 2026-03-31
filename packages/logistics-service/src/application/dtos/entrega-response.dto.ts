import { z } from "zod";
export const entregaResponseDtoSchema = z.object({
  id: z.string(), rotaId: z.string().nullable(), pedidoId: z.string(),
  status: z.string(), dataConfirmacao: z.string().nullable(),
});
export type EntregaResponseDto = z.infer<typeof entregaResponseDtoSchema>;
