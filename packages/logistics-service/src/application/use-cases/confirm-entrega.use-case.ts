import type { IEntregaRepository } from "../ports/entrega-repository.port";
import type { IEventPublisher } from "../ports/event-publisher.port";
import type { EntregaResponseDto } from "../dtos/entrega-response.dto";
import { EntregaNotFoundError, InvalidStatusTransitionError } from "../errors";
import { EXCHANGE_LOGISTICS_EVENTS, DELIVERY_CONFIRMED_EVENT } from "@lframework/shared";

export class ConfirmEntregaUseCase {
  constructor(
    private readonly entregaRepository: IEntregaRepository,
    private readonly eventPublisher: IEventPublisher
  ) {}

  async execute(entregaId: string): Promise<EntregaResponseDto> {
    const entrega = await this.entregaRepository.findById(entregaId);
    if (!entrega) throw new EntregaNotFoundError(`Entrega ${entregaId} not found`);

    try { entrega.confirmar(); } catch (err) {
      throw new InvalidStatusTransitionError(err instanceof Error ? err.message : "Invalid status transition");
    }

    await this.entregaRepository.update(entrega);

    await this.eventPublisher.publish(EXCHANGE_LOGISTICS_EVENTS, DELIVERY_CONFIRMED_EVENT, {
      entregaId: entrega.id, pedidoId: entrega.pedidoId, rotaId: entrega.rotaId,
      dataConfirmacao: entrega.dataConfirmacao?.toISOString(),
    });

    return { id: entrega.id, rotaId: entrega.rotaId, pedidoId: entrega.pedidoId, status: entrega.status, dataConfirmacao: entrega.dataConfirmacao?.toISOString() ?? null };
  }
}
