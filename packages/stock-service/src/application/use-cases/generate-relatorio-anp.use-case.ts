import type { IMovimentacaoRepository } from "../ports/movimentacao-repository.port";
import type { RelatorioAnpDto, RelatorioAnpFilterDto, RelatorioAnpTotais } from "../dtos/relatorio-anp.dto";

export class GenerateRelatorioAnpUseCase {
  constructor(private readonly movimentacaoRepository: IMovimentacaoRepository) {}

  async execute(filter: RelatorioAnpFilterDto): Promise<RelatorioAnpDto> {
    const dataInicio = new Date(filter.dataInicio);
    const dataFim = new Date(filter.dataFim);

    const movimentacoes = await this.movimentacaoRepository.findByPeriod(dataInicio, dataFim, filter.unidadeId);

    const map = new Map<string, RelatorioAnpTotais>();

    for (const m of movimentacoes) {
      let totais = map.get(m.vasilhameId);
      if (!totais) {
        totais = { vasilhameId: m.vasilhameId, entradas: 0, saidas: 0, retornos: 0, avarias: 0, ajustes: 0, saldo: 0 };
        map.set(m.vasilhameId, totais);
      }

      switch (m.tipoMovimentacao) {
        case "ENTRADA":  totais.entradas += m.quantidade; totais.saldo += m.quantidade; break;
        case "SAIDA":    totais.saidas += m.quantidade; totais.saldo -= m.quantidade; break;
        case "RETORNO":  totais.retornos += m.quantidade; totais.saldo += m.quantidade; break;
        case "AVARIA":   totais.avarias += m.quantidade; totais.saldo -= m.quantidade; break;
        case "AJUSTE":   totais.ajustes += m.quantidade; totais.saldo += m.quantidade; break;
      }
    }

    return {
      periodo: { inicio: dataInicio.toISOString(), fim: dataFim.toISOString() },
      unidadeId: filter.unidadeId ?? null,
      totalMovimentacoes: movimentacoes.length,
      totaisPorVasilhame: Array.from(map.values()),
    };
  }
}
