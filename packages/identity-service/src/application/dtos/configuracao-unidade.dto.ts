import { z } from "zod";

export const upsertConfiguracaoSchema = z.object({
  unidadeId: z.string().uuid("unidadeId inválido"),
  chave: z.string().trim().min(1, "Chave é obrigatória").max(100),
  valor: z.string().max(1000),
});

export type UpsertConfiguracaoDto = z.infer<typeof upsertConfiguracaoSchema>;

export const configuracaoUnidadeResponseDtoSchema = z.object({
  id: z.string(),
  unidadeId: z.string(),
  chave: z.string(),
  valor: z.string(),
  createdAt: z.string(),
});

export type ConfiguracaoUnidadeResponseDto = z.infer<typeof configuracaoUnidadeResponseDtoSchema>;
