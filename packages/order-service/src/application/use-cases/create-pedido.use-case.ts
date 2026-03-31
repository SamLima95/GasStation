import { randomUUID } from "crypto";
import { Pedido } from "../../domain/entities/pedido.entity";
import { ItemPedido } from "../../domain/entities/item-pedido.entity";
import { TipoPagamento } from "../../domain/types";
import type { IClienteRepository } from "../ports/cliente-repository.port";
import type { IPedidoRepository } from "../ports/pedido-repository.port";
import type { IEventPublisher } from "../ports/event-publisher.port";
import type { CreatePedidoDto } from "../dtos/create-pedido.dto";
import type { PedidoResponseDto } from "../dtos/pedido-response.dto";
import { ClienteNotFoundError, CreditLimitExceededError, InvalidPedidoError } from "../errors";
import { EXCHANGE_ORDER_EVENTS, ORDER_CREATED_EVENT } from "@lframework/shared";

export class CreatePedidoUseCase {
  constructor(
    private readonly pedidoRepository: IPedidoRepository,
    private readonly clienteRepository: IClienteRepository,
    private readonly eventPublisher: IEventPublisher
  ) {}

  async execute(dto: CreatePedidoDto): Promise<PedidoResponseDto> {
    // Buscar cliente
    const cliente = await this.clienteRepository.findById(dto.clienteId);
    if (!cliente) {
      throw new ClienteNotFoundError(`Cliente ${dto.clienteId} not found`);
    }

    const pedidoId = randomUUID();

    try {
      // Criar itens
      const itens = dto.itens.map((item) =>
        ItemPedido.create(randomUUID(), pedidoId, item.vasilhameId, item.quantidade, item.precoUnitario)
      );

      // Criar pedido (calcula valorTotal internamente)
      const tipoPagamento = dto.tipoPagamento as TipoPagamento;
      const dataEntregaPrevista = dto.dataEntregaPrevista ? new Date(dto.dataEntregaPrevista) : null;
      const pedido = Pedido.create(pedidoId, dto.clienteId, dto.unidadeId, tipoPagamento, itens, dataEntregaPrevista);

      // RN11: Se fiado, verificar limite de crédito
      if (tipoPagamento === TipoPagamento.FIADO) {
        if (!cliente.verificarLimiteCredito(pedido.valorTotal)) {
          throw new CreditLimitExceededError(
            `Valor ${pedido.valorTotal} excede limite disponível (limite: ${cliente.limiteCredito}, devedor: ${cliente.saldoDevedor})`
          );
        }
        // Atualizar saldo devedor do cliente
        cliente.adicionarSaldoDevedor(pedido.valorTotal);
        await this.clienteRepository.updateSaldoDevedor(cliente.id, cliente.saldoDevedor);
      }

      // Salvar pedido com itens
      await this.pedidoRepository.save(pedido);

      // Publicar evento order.created
      await this.eventPublisher.publish(EXCHANGE_ORDER_EVENTS, ORDER_CREATED_EVENT, {
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
    } catch (err) {
      if (err instanceof ClienteNotFoundError || err instanceof CreditLimitExceededError) throw err;
      throw new InvalidPedidoError(err instanceof Error ? err.message : "Invalid pedido");
    }
  }
}
