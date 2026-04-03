import amqp from "amqplib";
import { z } from "zod";
import {
  EXCHANGE_AUDIT_EVENTS,
  QUEUE_AUDIT_LOGGED,
  QUEUE_AUDIT_LOGGED_FAILED,
  AUDIT_EVENT,
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
        logger.error({ err }, "Falha ao processar evento de auditoria");
        // Envia para fila de falhas
        this.channel.publish("", QUEUE_AUDIT_LOGGED_FAILED, msg.content, { persistent: true });
        this.channel.nack(msg, false, false);
      }
    });

    logger.info("Audit consumer iniciado — escutando %s", QUEUE_AUDIT_LOGGED);
  }

  async close(): Promise<void> {
    if (this.channel) { await this.channel.close(); this.channel = null; }
    if (this.connection) { await this.connection.close(); this.connection = null; }
  }
}
