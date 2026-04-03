import type { IMovimentacaoRepository } from "../ports/movimentacao-repository.port";
import type { MovimentacaoResponseDto } from "../dtos/movimentacao-response.dto";

export class ListMovimentacoesUseCase {
  constructor(private readonly movimentacaoRepository: IMovimentacaoRepository) {}

  async execute(unidadeId?: string): Promise<MovimentacaoResponseDto[]> {
    const movimentacoes = unidadeId
      ? await this.movimentacaoRepository.findByUnidadeId(unidadeId)
      : await this.movimentacaoRepository.findAll();
    return movimentacoes.map((m) => ({
      id: m.id,
      unidadeId: m.unidadeId,
      vasilhameId: m.vasilhameId,
      usuarioId: m.usuarioId,
      pedidoId: m.pedidoId,
      tipoMovimentacao: m.tipoMovimentacao,
      quantidade: m.quantidade,
      dataHora: m.dataHora.toISOString(),
    }));
  }
}
