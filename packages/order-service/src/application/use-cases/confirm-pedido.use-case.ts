import type { IPedidoRepository } from "../ports/pedido-repository.port";
import type { IEventPublisher } from "../ports/event-publisher.port";
import type { PedidoResponseDto } from "../dtos/pedido-response.dto";
import { PedidoNotFoundError, InvalidStatusTransitionError } from "../errors";
import { EXCHANGE_ORDER_EVENTS, ORDER_CONFIRMED_EVENT } from "@lframework/shared";

export class ConfirmPedidoUseCase {
  constructor(
    private readonly pedidoRepository: IPedidoRepository,
    private readonly eventPublisher: IEventPublisher
  ) {}

  async execute(pedidoId: string): Promise<PedidoResponseDto> {
    const pedido = await this.pedidoRepository.findById(pedidoId);
    if (!pedido) {
      throw new PedidoNotFoundError(`Pedido ${pedidoId} not found`);
    }

    try {
      pedido.confirmar();
    } catch (err) {
      throw new InvalidStatusTransitionError(err instanceof Error ? err.message : "Invalid status transition");
    }

    await this.pedidoRepository.updateStatus(pedido.id, pedido.status);

    await this.eventPublisher.publish(EXCHANGE_ORDER_EVENTS, ORDER_CONFIRMED_EVENT, {
      pedidoId: pedido.id,
      clienteId: pedido.clienteId,
      unidadeId: pedido.unidadeId,
      valorTotal: pedido.valorTotal,
      status: pedido.status,
      tipoPagamento: pedido.tipoPagamento,
    });

    return {
      id: pedido.id,
      clienteId: pedido.clienteId,
      unidadeId: pedido.unidadeId,
      status: pedido.status,
      tipoPagamento: pedido.tipoPagamento,
      valorTotal: pedido.valorTotal,
      dataPedido: pedido.dataPedido.toISOString(),
      dataEntregaPrevista: pedido.dataEntregaPrevista?.toISOString() ?? null,
      itens: pedido.itens.map((item) => ({
        id: item.id,
        pedidoId: item.pedidoId,
        vasilhameId: item.vasilhameId,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
      })),
    };
  }
}
