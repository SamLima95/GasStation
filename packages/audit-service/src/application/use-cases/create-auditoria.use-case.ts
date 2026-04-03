import { randomUUID } from "crypto";
import { Auditoria } from "../../domain/entities/auditoria.entity";
import type { IAuditoriaRepository } from "../ports/auditoria-repository.port";
import type { AuditEventPayload } from "@lframework/shared";
import type { AuditoriaResponseDto } from "../dtos/auditoria.dto";

export class CreateAuditoriaUseCase {
  constructor(private readonly auditoriaRepository: IAuditoriaRepository) {}

  async execute(payload: AuditEventPayload): Promise<AuditoriaResponseDto> {
    const id = randomUUID();
    const auditoria = Auditoria.create(
      id, payload.servico, payload.entidade, payload.entidadeId,
      payload.acao, payload.usuarioId, payload.unidadeId,
      payload.detalhes, new Date(payload.occurredAt)
    );
    await this.auditoriaRepository.save(auditoria);

    return {
      id: auditoria.id, servico: auditoria.servico, entidade: auditoria.entidade,
      entidadeId: auditoria.entidadeId, acao: auditoria.acao,
      usuarioId: auditoria.usuarioId, unidadeId: auditoria.unidadeId,
      detalhes: auditoria.detalhes,
      occurredAt: auditoria.occurredAt.toISOString(),
      createdAt: auditoria.createdAt.toISOString(),
    };
  }
}
