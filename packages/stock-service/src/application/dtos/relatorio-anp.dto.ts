import { z } from "zod";

export const relatorioAnpFilterSchema = z.object({
  dataInicio: z.string().min(1, "dataInicio é obrigatório"),
  dataFim: z.string().min(1, "dataFim é obrigatório"),
  unidadeId: z.string().optional(),
});

export type RelatorioAnpFilterDto = z.infer<typeof relatorioAnpFilterSchema>;

export interface RelatorioAnpTotais {
  vasilhameId: string;
  entradas: number;
  saidas: number;
  retornos: number;
  avarias: number;
  ajustes: number;
  saldo: number;
}

export interface RelatorioAnpDto {
  periodo: { inicio: string; fim: string };
  unidadeId: string | null;
  totalMovimentacoes: number;
  totaisPorVasilhame: RelatorioAnpTotais[];
}
