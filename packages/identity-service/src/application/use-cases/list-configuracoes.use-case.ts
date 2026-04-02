import type { IConfiguracaoUnidadeRepository } from "../ports/configuracao-unidade-repository.port";
import type { ConfiguracaoUnidadeResponseDto } from "../dtos/configuracao-unidade.dto";

export class ListConfiguracoesUseCase {
  constructor(private readonly configuracaoRepository: IConfiguracaoUnidadeRepository) {}

  async execute(unidadeId: string): Promise<ConfiguracaoUnidadeResponseDto[]> {
    return this.configuracaoRepository.findByUnidadeId(unidadeId);
  }
}
