import { z } from "zod";

export const vasilhameResponseDtoSchema = z.object({
  id: z.string(),
  tipo: z.string(),
  descricao: z.string(),
  capacidade: z.number(),
  createdAt: z.string(),
});

export type VasilhameResponseDto = z.infer<typeof vasilhameResponseDtoSchema>;
