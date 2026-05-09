import type { AuditEventPayload } from "@lframework/shared";

export type AuditLogInput = Omit<AuditEventPayload, "servico" | "occurredAt"> & {
  occurredAt?: string;
};

export interface IAuditLogger {
  log(input: AuditLogInput): Promise<void>;
}
