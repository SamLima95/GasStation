import amqp, { ConsumeMessage } from "amqplib";
import { LRUCache } from "lru-cache";
import { z } from "zod";
import type { OrderConfirmedPayload } from "../../../application/ports/event-consumer.port";
import { EXCHANGE_ORDER_EVENTS, ORDER_CONFIRMED_EVENT, QUEUE_ORDER_CONFIRMED_LOGISTICS, QUEUE_ORDER_CONFIRMED_LOGISTICS_FAILED, logger } from "@lframework/shared";

const MAX_RETRIES = 5; const RETRY_BASE_MS = 2000; const RETRY_HEADER = "x-retry-count";
const schema = z.object({ pedidoId: z.string().min(1), clienteId: z.string().min(1), unidadeId: z.string().min(1), valorTotal: z.coerce.number().positive(), status: z.string(), tipoPagamento: z.string() });
type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;

export class RabbitMqOrderConfirmedConsumer {
  private handler: ((p: OrderConfirmedPayload) => Promise<void>) | null = null;
  private channel: amqp.Channel | null = null;
  private readonly retryCount = new LRUCache<string, number>({ max: 10_000, ttl: 3600000 });
  private readonly pendingTimeouts = new Set<ReturnType<typeof setTimeout>>();
  constructor(private readonly connection: AmqpConnection) {}
  onOrderConfirmed(fn: (p: OrderConfirmedPayload) => Promise<void>): void { this.handler = fn; }

  async start(): Promise<void> {
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(EXCHANGE_ORDER_EVENTS, "topic", { durable: true });
    await this.channel.assertQueue(QUEUE_ORDER_CONFIRMED_LOGISTICS, { durable: true });
    await this.channel.bindQueue(QUEUE_ORDER_CONFIRMED_LOGISTICS, EXCHANGE_ORDER_EVENTS, ORDER_CONFIRMED_EVENT);
    await this.channel.assertQueue(QUEUE_ORDER_CONFIRMED_LOGISTICS_FAILED, { durable: true });
    await this.channel.consume(QUEUE_ORDER_CONFIRMED_LOGISTICS, async (msg: ConsumeMessage | null) => {
      if (!msg || !this.handler || !this.channel) return;
      try {
        const body = JSON.parse(msg.content.toString());
        if (body.type !== ORDER_CONFIRMED_EVENT || !body.payload) { this.channel.ack(msg); return; }
        const parsed = schema.safeParse(body.payload);
        if (!parsed.success) { logger.warn({ validation: parsed.error.flatten() }, "Invalid OrderConfirmed payload"); this.channel.nack(msg, false, false); return; }
        await this.handler(parsed.data); this.retryCount.delete(msg.content.toString()); this.channel.ack(msg);
      } catch (err) {
        const key = msg.content.toString();
        const prev = (typeof msg.properties?.headers?.[RETRY_HEADER] === "number" ? msg.properties.headers[RETRY_HEADER] : this.retryCount.get(key)) ?? 0;
        const count = prev + 1; this.retryCount.set(key, count);
        if (count >= MAX_RETRIES) { this.channel.sendToQueue(QUEUE_ORDER_CONFIRMED_LOGISTICS_FAILED, msg.content, { headers: { ...msg.properties?.headers, [RETRY_HEADER]: count } }); this.retryCount.delete(key); this.channel.nack(msg, false, false); }
        else { const delay = RETRY_BASE_MS * 2 ** (count - 1); const copy = Buffer.from(msg.content); const hdr = { ...msg.properties?.headers, [RETRY_HEADER]: count }; const tid = setTimeout(() => { this.pendingTimeouts.delete(tid); if (!this.channel) return; try { this.channel.publish(EXCHANGE_ORDER_EVENTS, ORDER_CONFIRMED_EVENT, copy, { headers: hdr }); this.channel.nack(msg, false, false); } catch {} }, delay); this.pendingTimeouts.add(tid); }
      }
    });
  }
  async closeChannel(): Promise<void> { for (const id of this.pendingTimeouts) clearTimeout(id); this.pendingTimeouts.clear(); if (this.channel) { await this.channel.close(); this.channel = null; } }
}
