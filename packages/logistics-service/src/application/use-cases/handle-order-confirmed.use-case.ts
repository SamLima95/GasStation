import { randomUUID } from "crypto";
import { Entrega } from "../../domain/entities/entrega.entity";
import type { IEntregaRepository } from "../ports/entrega-repository.port";
import type { OrderConfirmedPayload } from "../ports/event-consumer.port";
import { logger } from "@lframework/shared";

export class HandleOrderConfirmedUseCase {
  constructor(private readonly entregaRepository: IEntregaRepository) {}

  async execute(payload: OrderConfirmedPayload): Promise<void> {
    const entrega = Entrega.create(randomUUID(), payload.pedidoId);
    await this.entregaRepository.save(entrega);
    logger.info({ pedidoId: payload.pedidoId, entregaId: entrega.id }, "Entrega PENDENTE created from order.confirmed");
  }
}
