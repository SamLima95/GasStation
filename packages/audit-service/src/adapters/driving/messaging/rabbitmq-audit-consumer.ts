import amqp from "amqplib";
import { z } from "zod";
import {
  EXCHANGE_AUDIT_EVENTS,
  QUEUE_AUDIT_LOGGED,
  QUEUE_AUDIT_LOGGED_FAILED,
  AUDIT_EVENT,
  RABBITMQ_MAX_RETRIES,
  RABBITMQ_RETRY_BASE_MS,
  RABBITMQ_RETRY_HEADER,
  logger,
} from "@lframework/shared";
import type { AuditEventPayload } from "@lframework/shared";

const auditPayloadSchema = z.object({
  servico: z.string(),
  entidade: z.string(),
  entidadeId: z.string(),
  acao: z.string(),
  usuarioId: z.string().nullable(),
  unidadeId: z.string().nullable(),
  detalhes: z.record(z.unknown()).nullable(),
  occurredAt: z.string(),
});

type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;

export class RabbitMqAuditConsumer {
  private connection: AmqpConnection | null = null;
  private channel: amqp.Channel | null = null;
  private handler: ((payload: AuditEventPayload) => Promise<void>) | null = null;
  private readonly pendingTimeouts = new Set<ReturnType<typeof setTimeout>>();

  constructor(private readonly rabbitmqUrl: string) {}

  onAuditEvent(fn: (payload: AuditEventPayload) => Promise<void>): void {
    this.handler = fn;
  }

  async start(): Promise<void> {
    if (!this.handler) throw new Error("Register handler with onAuditEvent() before start()");

    this.connection = await amqp.connect(this.rabbitmqUrl, { timeout: 10_000 });
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(EXCHANGE_AUDIT_EVENTS, "topic", { durable: true });
    await this.channel.assertQueue(QUEUE_AUDIT_LOGGED, { durable: true });
    await this.channel.assertQueue(QUEUE_AUDIT_LOGGED_FAILED, { durable: true });
    await this.channel.bindQueue(QUEUE_AUDIT_LOGGED, EXCHANGE_AUDIT_EVENTS, AUDIT_EVENT);

    await this.channel.consume(QUEUE_AUDIT_LOGGED, async (msg) => {
      if (!msg || !this.handler || !this.channel) return;

      try {
        const body = JSON.parse(msg.content.toString());
        const payload = body.payload ?? body;
        const parsed = auditPayloadSchema.parse(payload);
        await this.handler(parsed);
        this.channel.ack(msg);
      } catch (err) {
        const prevCount =
          typeof msg.properties?.headers?.[RABBITMQ_RETRY_HEADER] === "number"
            ? msg.properties.headers[RABBITMQ_RETRY_HEADER]
            : 0;
        const count = prevCount + 1;
        const headers = {
          ...(msg.properties?.headers || {}),
          [RABBITMQ_RETRY_HEADER]: count,
        };

        if (count >= RABBITMQ_MAX_RETRIES) {
          logger.error({ err, retries: count }, "Falha ao processar evento de auditoria; enviando para failed");
          this.channel.sendToQueue(QUEUE_AUDIT_LOGGED_FAILED, msg.content, {
            headers,
            persistent: true,
          });
          this.channel.nack(msg, false, false);
          return;
        }

        const delayMs = RABBITMQ_RETRY_BASE_MS * 2 ** (count - 1);
        const contentCopy = Buffer.from(msg.content);
        logger.warn({ err, retry: count, maxRetries: RABBITMQ_MAX_RETRIES, delayMs }, "Falha ao processar evento de auditoria; reagendando");
        const timeoutId = setTimeout(() => {
          this.pendingTimeouts.delete(timeoutId);
          if (!this.channel) return;

          try {
            this.channel.sendToQueue(QUEUE_AUDIT_LOGGED, contentCopy, {
              headers,
              persistent: true,
            });
            this.channel.nack(msg, false, false);
          } catch (publishErr) {
            logger.error({ err: publishErr, retry: count }, "Falha ao republicar evento de auditoria");
            try {
              this.channel.nack(msg, false, true);
            } catch (nackErr) {
              logger.error({ err: nackErr }, "Falha ao devolver evento de auditoria para a fila");
            }
          }
        }, delayMs);
        this.pendingTimeouts.add(timeoutId);
      }
    });

    logger.info("Audit consumer iniciado — escutando %s", QUEUE_AUDIT_LOGGED);
  }

  async close(): Promise<void> {
    for (const id of this.pendingTimeouts) clearTimeout(id);
    this.pendingTimeouts.clear();
    if (this.channel) { await this.channel.close(); this.channel = null; }
    if (this.connection) { await this.connection.close(); this.connection = null; }
  }
}
