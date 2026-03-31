import { z } from "zod";
export const veiculoResponseDtoSchema = z.object({
  id: z.string(), placa: z.string(), modelo: z.string(), ativo: z.boolean(), unidadeId: z.string(),
});
export type VeiculoResponseDto = z.infer<typeof veiculoResponseDtoSchema>;
