import { randomUUID } from "crypto";
import { ContaAReceber } from "../../domain/entities/conta-a-receber.entity";
import type { IContaAReceberRepository } from "../ports/conta-a-receber-repository.port";
import type { OrderConfirmedPayload } from "../ports/event-consumer.port";
import { logger } from "@lframework/shared";

export class HandleOrderConfirmedUseCase {
  constructor(private readonly contaAReceberRepository: IContaAReceberRepository) {}

  async execute(payload: OrderConfirmedPayload): Promise<void> {
    if (payload.tipoPagamento !== "FIADO") return;

    const vencimento = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias
    const conta = ContaAReceber.create(randomUUID(), payload.pedidoId, payload.clienteId, payload.valorTotal, vencimento);
    await this.contaAReceberRepository.save(conta);

    logger.info({ pedidoId: payload.pedidoId, contaId: conta.id }, "ContaAReceber created from order.confirmed");
  }
}
