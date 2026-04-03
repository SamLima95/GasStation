import type { IEntregadorRepository } from "../ports/entregador-repository.port";
import type { EntregadorResponseDto } from "../dtos/entregador-response.dto";

export class ListEntregadoresUseCase {
  constructor(private readonly entregadorRepository: IEntregadorRepository) {}
  async execute(unidadeId?: string): Promise<EntregadorResponseDto[]> {
    const list = unidadeId
      ? await this.entregadorRepository.findByUnidadeId(unidadeId)
      : await this.entregadorRepository.findAll();
    return list.map((e) => ({ id: e.id, nome: e.nome, documento: e.documento, ativo: e.ativo, unidadeId: e.unidadeId }));
  }
}
