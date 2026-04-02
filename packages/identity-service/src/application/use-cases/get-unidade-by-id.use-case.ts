import type { IUnidadeRepository } from "../ports/unidade-repository.port";
import type { UnidadeResponseDto } from "../dtos/unidade.dto";

export class GetUnidadeByIdUseCase {
  constructor(private readonly unidadeRepository: IUnidadeRepository) {}

  async execute(id: string): Promise<UnidadeResponseDto | null> {
    const unidade = await this.unidadeRepository.findById(id);
    if (!unidade) return null;

    return {
      id: unidade.id,
      nome: unidade.nome,
      tipo: unidade.tipo,
      status: unidade.status,
      createdAt: unidade.createdAt.toISOString(),
    };
  }
}
