import amqp from "amqplib";
import type { IEventPublisher } from "../../../application/ports/event-publisher.port";

export class RabbitMqEventPublisher implements IEventPublisher {
  constructor(private readonly channel: amqp.Channel) {}
  async publish(exchange: string, routingKey: string, payload: unknown): Promise<void> {
    await this.channel.assertExchange(exchange, "topic", { durable: true });
    this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify({ type: routingKey, payload })), { persistent: true });
  }
}
