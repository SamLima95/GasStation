import { z } from "zod";

export const createUnidadeSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(200),
  tipo: z.enum(["filial", "deposito"]),
});

export type CreateUnidadeDto = z.infer<typeof createUnidadeSchema>;

export const unidadeResponseDtoSchema = z.object({
  id: z.string(),
  nome: z.string(),
  tipo: z.string(),
  status: z.string(),
  createdAt: z.string(),
});

export type UnidadeResponseDto = z.infer<typeof unidadeResponseDtoSchema>;
