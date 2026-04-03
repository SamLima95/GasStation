import { z } from "zod";

export const auditoriaResponseDtoSchema = z.object({
  id: z.string(),
  servico: z.string(),
  entidade: z.string(),
  entidadeId: z.string(),
  acao: z.string(),
  usuarioId: z.string().nullable(),
  unidadeId: z.string().nullable(),
  detalhes: z.record(z.unknown()).nullable(),
  occurredAt: z.string(),
  createdAt: z.string(),
});

export type AuditoriaResponseDto = z.infer<typeof auditoriaResponseDtoSchema>;

export const auditoriaFilterSchema = z.object({
  servico: z.string().optional(),
  entidade: z.string().optional(),
  entidadeId: z.string().optional(),
  acao: z.string().optional(),
  usuarioId: z.string().optional(),
  unidadeId: z.string().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
});

export type AuditoriaFilterDto = z.infer<typeof auditoriaFilterSchema>;
