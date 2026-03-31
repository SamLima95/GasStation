import amqp from "amqplib";
import type { UserCreatedPayload } from "@lframework/shared";
import type { OrderConfirmedPayload } from "../../../application/ports/event-consumer.port";
import { RabbitMqUserCreatedConsumer } from "./rabbitmq-user-created.consumer";
import { RabbitMqOrderConfirmedConsumer } from "./rabbitmq-order-confirmed.consumer";

export class RabbitMqLogisticsEventsAdapter {
  private userCreatedHandler: ((p: UserCreatedPayload) => Promise<void>) | null = null;
  private orderConfirmedHandler: ((p: OrderConfirmedPayload) => Promise<void>) | null = null;
  private userCreatedConsumer: RabbitMqUserCreatedConsumer | null = null;
  private orderConfirmedConsumer: RabbitMqOrderConfirmedConsumer | null = null;
  private connection: Awaited<ReturnType<typeof amqp.connect>> | null = null;

  constructor(private readonly rabbitmqUrl: string) {}

  onUserCreated(handler: (p: UserCreatedPayload) => Promise<void>): void { this.userCreatedHandler = handler; }
  onOrderConfirmed(handler: (p: OrderConfirmedPayload) => Promise<void>): void { this.orderConfirmedHandler = handler; }

  async start(): Promise<void> {
    if (!this.userCreatedHandler) throw new Error("Registre handler com onUserCreated()");
    if (!this.orderConfirmedHandler) throw new Error("Registre handler com onOrderConfirmed()");
    this.connection = await amqp.connect(this.rabbitmqUrl, { timeout: 10_000 });
    this.userCreatedConsumer = new RabbitMqUserCreatedConsumer(this.connection);
    this.userCreatedConsumer.onUserCreated(this.userCreatedHandler);
    await this.userCreatedConsumer.start();
    this.orderConfirmedConsumer = new RabbitMqOrderConfirmedConsumer(this.connection);
    this.orderConfirmedConsumer.onOrderConfirmed(this.orderConfirmedHandler);
    await this.orderConfirmedConsumer.start();
  }

  async close(): Promise<void> {
    if (this.userCreatedConsumer) await this.userCreatedConsumer.closeChannel();
    if (this.orderConfirmedConsumer) await this.orderConfirmedConsumer.closeChannel();
    if (this.connection) await (this.connection as any).close();
    this.userCreatedConsumer = null; this.orderConfirmedConsumer = null; this.connection = null;
  }
}
