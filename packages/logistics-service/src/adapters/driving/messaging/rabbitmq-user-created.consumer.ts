import amqp, { ConsumeMessage } from "amqplib";
import { LRUCache } from "lru-cache";
import { z } from "zod";
import type { UserCreatedPayload } from "@lframework/shared";
import { USER_CREATED_EVENT, EXCHANGE_USER_EVENTS, QUEUE_USER_CREATED_LOGISTICS, QUEUE_USER_CREATED_LOGISTICS_FAILED, nameSchema, logger } from "@lframework/shared";

const MAX_RETRIES = 5; const RETRY_BASE_MS = 2000; const RETRY_HEADER = "x-retry-count";
const userCreatedPayloadSchema = z.object({
  userId: z.string().min(1).max(64),
  email: z.string().min(1).transform((s) => s.trim().toLowerCase()).refine((s) => s.length <= 254).refine((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)),
  name: nameSchema,
  occurredAt: z.string().min(1).refine((s) => !isNaN(new Date(s).getTime())).transform((s) => new Date(s).toISOString()),
});
type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;

export class RabbitMqUserCreatedConsumer {
  private handler: ((p: UserCreatedPayload) => Promise<void>) | null = null;
  private channel: amqp.Channel | null = null;
  private readonly retryCount = new LRUCache<string, number>({ max: 10_000, ttl: 3600000 });
  private readonly pendingTimeouts = new Set<ReturnType<typeof setTimeout>>();
  constructor(private readonly connection: AmqpConnection) {}
  onUserCreated(fn: (p: UserCreatedPayload) => Promise<void>): void { this.handler = fn; }

  async start(): Promise<void> {
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(EXCHANGE_USER_EVENTS, "topic", { durable: true });
    await this.channel.assertQueue(QUEUE_USER_CREATED_LOGISTICS, { durable: true });
    await this.channel.bindQueue(QUEUE_USER_CREATED_LOGISTICS, EXCHANGE_USER_EVENTS, "user_created");
    await this.channel.assertQueue(QUEUE_USER_CREATED_LOGISTICS_FAILED, { durable: true });
    await this.channel.consume(QUEUE_USER_CREATED_LOGISTICS, async (msg: ConsumeMessage | null) => {
      if (!msg || !this.handler || !this.channel) return;
      try {
        const body = JSON.parse(msg.content.toString());
        if (body.type !== USER_CREATED_EVENT || !body.payload) { this.channel.ack(msg); return; }
        const parsed = userCreatedPayloadSchema.safeParse(body.payload);
        if (!parsed.success) { this.channel.nack(msg, false, false); return; }
        await this.handler(parsed.data); this.retryCount.delete(msg.content.toString()); this.channel.ack(msg);
      } catch (err) {
        const key = msg.content.toString();
        const prev = (typeof msg.properties?.headers?.[RETRY_HEADER] === "number" ? msg.properties.headers[RETRY_HEADER] : this.retryCount.get(key)) ?? 0;
        const count = prev + 1; this.retryCount.set(key, count);
        if (count >= MAX_RETRIES) { this.channel.sendToQueue(QUEUE_USER_CREATED_LOGISTICS_FAILED, msg.content, { headers: { ...msg.properties?.headers, [RETRY_HEADER]: count } }); this.retryCount.delete(key); this.channel.nack(msg, false, false); }
        else { const delay = RETRY_BASE_MS * 2 ** (count - 1); const copy = Buffer.from(msg.content); const hdr = { ...msg.properties?.headers, [RETRY_HEADER]: count }; const tid = setTimeout(() => { this.pendingTimeouts.delete(tid); if (!this.channel) return; try { this.channel.publish(EXCHANGE_USER_EVENTS, "user_created", copy, { headers: hdr }); this.channel.nack(msg, false, false); } catch {} }, delay); this.pendingTimeouts.add(tid); }
      }
    });
  }
  async closeChannel(): Promise<void> { for (const id of this.pendingTimeouts) clearTimeout(id); this.pendingTimeouts.clear(); if (this.channel) { await this.channel.close(); this.channel = null; } }
}
