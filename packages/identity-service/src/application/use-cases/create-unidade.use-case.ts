import { randomUUID } from "crypto";
import { Unidade } from "../../domain/entities/unidade.entity";
import type { IUnidadeRepository } from "../ports/unidade-repository.port";
import type { CreateUnidadeDto, UnidadeResponseDto } from "../dtos/unidade.dto";

export class CreateUnidadeUseCase {
  constructor(private readonly unidadeRepository: IUnidadeRepository) {}

  async execute(dto: CreateUnidadeDto): Promise<UnidadeResponseDto> {
    const id = randomUUID();
    const unidade = Unidade.create(id, dto.nome, dto.tipo);
    await this.unidadeRepository.save(unidade);

    return {
      id: unidade.id,
      nome: unidade.nome,
      tipo: unidade.tipo,
      status: unidade.status,
      createdAt: unidade.createdAt.toISOString(),
    };
  }
}
