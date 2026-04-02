import type { IUnidadeRepository } from "../ports/unidade-repository.port";
import type { UnidadeResponseDto } from "../dtos/unidade.dto";

export class ListUnidadesUseCase {
  constructor(private readonly unidadeRepository: IUnidadeRepository) {}

  async execute(): Promise<UnidadeResponseDto[]> {
    const unidades = await this.unidadeRepository.findAll();
    return unidades.map((u) => ({
      id: u.id,
      nome: u.nome,
      tipo: u.tipo,
      status: u.status,
      createdAt: u.createdAt.toISOString(),
    }));
  }
}
