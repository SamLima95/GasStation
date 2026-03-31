import { z } from "zod";

export const movimentacaoResponseDtoSchema = z.object({
  id: z.string(),
  unidadeId: z.string(),
  vasilhameId: z.string(),
  usuarioId: z.string(),
  pedidoId: z.string().nullable(),
  tipoMovimentacao: z.string(),
  quantidade: z.number(),
  dataHora: z.string(),
});

export type MovimentacaoResponseDto = z.infer<typeof movimentacaoResponseDtoSchema>;
