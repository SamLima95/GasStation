import type { UserCreatedPayload } from "@lframework/shared";

export interface OrderConfirmedPayload {
  pedidoId: string;
  clienteId: string;
  unidadeId: string;
  valorTotal: number;
  status: string;
  tipoPagamento: string;
}

export interface IEventConsumer {
  onUserCreated(handler: (payload: UserCreatedPayload) => Promise<void>): void;
  onOrderConfirmed(handler: (payload: OrderConfirmedPayload) => Promise<void>): void;
}
