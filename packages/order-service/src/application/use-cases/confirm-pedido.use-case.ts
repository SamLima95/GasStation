import { randomUUID } from "crypto";
import type { IPedidoRepository } from "../ports/pedido-repository.port";
import type { IEventPublisher } from "../ports/event-publisher.port";
import type { INfEmitter } from "../ports/nf-emitter.port";
import type { INotaFiscalRepository } from "../ports/nota-fiscal-repository.port";
import type { PedidoResponseDto } from "../dtos/pedido-response.dto";
import { PedidoNotFoundError, InvalidStatusTransitionError } from "../errors";
import { EXCHANGE_ORDER_EVENTS, ORDER_CONFIRMED_EVENT, logger } from "@lframework/shared";
import { NotaFiscal } from "../../domain/entities/nota-fiscal.entity";

export class ConfirmPedidoUseCase {
  constructor(
    private readonly pedidoRepository: IPedidoRepository,
    private readonly eventPublisher: IEventPublisher,
    private readonly nfEmitter: INfEmitter,
    private readonly notaFiscalRepository: INotaFiscalRepository
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

    // Emissão de NF-e assíncrona — falha não bloqueia confirmação (RN12)
    try {
      const nf = NotaFiscal.create(randomUUID(), pedido.id);
      await this.notaFiscalRepository.save(nf);

      const result = await this.nfEmitter.emitir(pedido.id, pedido.valorTotal, pedido.unidadeId);
      if (result.status === "AUTORIZADA") {
        nf.autorizar(result.chaveAcesso);
      } else {
        nf.rejeitar(result.mensagem);
      }
      await this.notaFiscalRepository.update(nf);
    } catch (err) {
      logger.error({ err, pedidoId: pedido.id }, "Falha na emissão de NF-e — pedido confirmado sem NF");
    }

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
