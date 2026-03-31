import { z } from "zod";

const TIPOS_MOVIMENTACAO = ["ENTRADA", "SAIDA", "RETORNO", "AVARIA", "AJUSTE"] as const;

export const createMovimentacaoSchema = z.object({
  unidadeId: z.string().min(1, "unidadeId is required").max(64),
  vasilhameId: z.string().min(1, "vasilhameId is required").max(64),
  usuarioId: z.string().min(1, "usuarioId is required").max(64),
  pedidoId: z.string().max(64).optional().nullable().default(null),
  tipoMovimentacao: z.enum(TIPOS_MOVIMENTACAO),
  quantidade: z.coerce
    .number()
    .int("quantidade must be an integer")
    .positive("quantidade must be positive"),
});

export type CreateMovimentacaoDto = z.infer<typeof createMovimentacaoSchema>;
