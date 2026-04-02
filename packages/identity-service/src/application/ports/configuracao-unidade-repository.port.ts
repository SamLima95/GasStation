import type { ConfiguracaoUnidadeResponseDto } from "../dtos/configuracao-unidade.dto";

export interface IConfiguracaoUnidadeRepository {
  upsert(unidadeId: string, chave: string, valor: string): Promise<ConfiguracaoUnidadeResponseDto>;
  findByUnidadeId(unidadeId: string): Promise<ConfiguracaoUnidadeResponseDto[]>;
  findByChave(unidadeId: string, chave: string): Promise<ConfiguracaoUnidadeResponseDto | null>;
}
