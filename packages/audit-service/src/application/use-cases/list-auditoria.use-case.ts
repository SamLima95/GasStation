import type { IAuditoriaRepository } from "../ports/auditoria-repository.port";
import type { AuditoriaFilterDto, AuditoriaResponseDto } from "../dtos/auditoria.dto";

export class ListAuditoriaUseCase {
  constructor(private readonly auditoriaRepository: IAuditoriaRepository) {}

  async execute(filters: AuditoriaFilterDto): Promise<AuditoriaResponseDto[]> {
    const list = await this.auditoriaRepository.findWithFilters(filters);
    return list.map((a) => ({
      id: a.id, servico: a.servico, entidade: a.entidade,
      entidadeId: a.entidadeId, acao: a.acao,
      usuarioId: a.usuarioId, unidadeId: a.unidadeId,
      detalhes: a.detalhes,
      occurredAt: a.occurredAt.toISOString(),
      createdAt: a.createdAt.toISOString(),
    }));
  }
}
