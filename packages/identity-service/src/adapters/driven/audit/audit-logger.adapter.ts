import { AUDIT_EVENT, logger } from "@lframework/shared";
import type { AuditEventPayload } from "@lframework/shared";
import type { IEventPublisher } from "../../../application/ports/event-publisher.port";
import type { AuditLogInput, IAuditLogger } from "../../../application/ports/audit-logger.port";

export class AuditLoggerAdapter implements IAuditLogger {
  constructor(private readonly eventPublisher: IEventPublisher) {}

  async log(input: AuditLogInput): Promise<void> {
    const payload: AuditEventPayload = {
      servico: "identity-service",
      entidade: input.entidade,
      entidadeId: input.entidadeId,
      acao: input.acao,
      usuarioId: input.usuarioId,
      unidadeId: input.unidadeId,
      detalhes: input.detalhes,
      occurredAt: input.occurredAt ?? new Date().toISOString(),
    };

    try {
      await this.eventPublisher.publish(AUDIT_EVENT, payload);
    } catch (err) {
      logger.warn({ err, auditAction: payload.acao }, "Falha ao publicar auditoria");
    }
  }
}
