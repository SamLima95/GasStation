import type { IPedidoRepository } from "../ports/pedido-repository.port";
import type { PedidoResponseDto } from "../dtos/pedido-response.dto";

export class ListPedidosUseCase {
  constructor(private readonly pedidoRepository: IPedidoRepository) {}

  async execute(unidadeId?: string): Promise<PedidoResponseDto[]> {
    const pedidos = unidadeId
      ? await this.pedidoRepository.findByUnidadeId(unidadeId)
      : await this.pedidoRepository.findAll();
    return pedidos.map((p) => ({
      id: p.id,
      clienteId: p.clienteId,
      unidadeId: p.unidadeId,
      status: p.status,
      tipoPagamento: p.tipoPagamento,
      valorTotal: p.valorTotal,
      dataPedido: p.dataPedido.toISOString(),
      dataEntregaPrevista: p.dataEntregaPrevista?.toISOString() ?? null,
      itens: p.itens.map((item) => ({
        id: item.id,
        pedidoId: item.pedidoId,
        vasilhameId: item.vasilhameId,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
      })),
    }));
  }
}
