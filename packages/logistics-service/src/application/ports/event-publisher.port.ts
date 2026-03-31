export interface IEventPublisher {
  publish(exchange: string, routingKey: string, payload: unknown): Promise<void>;
}
