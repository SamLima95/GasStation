import type { IConfiguracaoUnidadeRepository } from "../ports/configuracao-unidade-repository.port";
import type { IUnidadeRepository } from "../ports/unidade-repository.port";
import type { UpsertConfiguracaoDto, ConfiguracaoUnidadeResponseDto } from "../dtos/configuracao-unidade.dto";
import { UnidadeNotFoundError } from "../errors";

export class UpsertConfiguracaoUseCase {
  constructor(
    private readonly configuracaoRepository: IConfiguracaoUnidadeRepository,
    private readonly unidadeRepository: IUnidadeRepository
  ) {}

  async execute(dto: UpsertConfiguracaoDto): Promise<ConfiguracaoUnidadeResponseDto> {
    const unidade = await this.unidadeRepository.findById(dto.unidadeId);
    if (!unidade) throw new UnidadeNotFoundError();

    return this.configuracaoRepository.upsert(dto.unidadeId, dto.chave, dto.valor);
  }
}
