import { randomUUID } from "crypto";
import { MovimentacaoEstoque } from "../../domain/entities/movimentacao-estoque.entity";
import { TipoMovimentacao } from "../../domain/types";
import type { IMovimentacaoRepository } from "../ports/movimentacao-repository.port";
import type { IVasilhameRepository } from "../ports/vasilhame-repository.port";
import type { CreateMovimentacaoDto } from "../dtos/create-movimentacao.dto";
import type { MovimentacaoResponseDto } from "../dtos/movimentacao-response.dto";
import { InvalidMovimentacaoError, VasilhameNotFoundError } from "../errors";

export class CreateMovimentacaoUseCase {
  constructor(
    private readonly movimentacaoRepository: IMovimentacaoRepository,
    private readonly vasilhameRepository: IVasilhameRepository
  ) {}

  async execute(dto: CreateMovimentacaoDto): Promise<MovimentacaoResponseDto> {
    const vasilhame = await this.vasilhameRepository.findById(dto.vasilhameId);
    if (!vasilhame) {
      throw new VasilhameNotFoundError(`Vasilhame ${dto.vasilhameId} not found`);
    }

    const id = randomUUID();
    try {
      const movimentacao = MovimentacaoEstoque.create(
        id,
        dto.unidadeId,
        dto.vasilhameId,
        dto.usuarioId,
        dto.pedidoId ?? null,
        dto.tipoMovimentacao as TipoMovimentacao,
        dto.quantidade
      );
      await this.movimentacaoRepository.save(movimentacao);

      const result: MovimentacaoResponseDto = {
        id: movimentacao.id,
        unidadeId: movimentacao.unidadeId,
        vasilhameId: movimentacao.vasilhameId,
        usuarioId: movimentacao.usuarioId,
        pedidoId: movimentacao.pedidoId,
        tipoMovimentacao: movimentacao.tipoMovimentacao,
        quantidade: movimentacao.quantidade,
        dataHora: movimentacao.dataHora.toISOString(),
      };
      return result;
    } catch (err) {
      if (err instanceof VasilhameNotFoundError) throw err;
      throw new InvalidMovimentacaoError(err instanceof Error ? err.message : "Invalid movimentacao");
    }
  }
}
