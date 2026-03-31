import { Prisma, PrismaClient } from "../../../../generated/prisma-client";
import { Pedido } from "../../../domain/entities/pedido.entity";
import { ItemPedido } from "../../../domain/entities/item-pedido.entity";
import { StatusPedido, TipoPagamento } from "../../../domain/types";
import type { IPedidoRepository } from "../../../application/ports/pedido-repository.port";

export class PrismaPedidoRepository implements IPedidoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(pedido: Pedido): Promise<void> {
    await this.prisma.pedidoModel.create({
      data: {
        id: pedido.id,
        clienteId: pedido.clienteId,
        unidadeId: pedido.unidadeId,
        status: pedido.status,
        tipoPagamento: pedido.tipoPagamento,
        valorTotal: new Prisma.Decimal(pedido.valorTotal),
        dataPedido: pedido.dataPedido,
        dataEntregaPrevista: pedido.dataEntregaPrevista,
        itens: {
          create: pedido.itens.map((item) => ({
            id: item.id,
            vasilhameId: item.vasilhameId,
            quantidade: item.quantidade,
            precoUnitario: new Prisma.Decimal(item.precoUnitario),
          })),
        },
      },
    });
  }

  async findById(id: string): Promise<Pedido | null> {
    const row = await this.prisma.pedidoModel.findUnique({
      where: { id },
      include: { itens: true },
    });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findByClienteId(clienteId: string): Promise<Pedido[]> {
    const rows = await this.prisma.pedidoModel.findMany({
      where: { clienteId },
      include: { itens: true },
      orderBy: { dataPedido: "desc" },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findByUnidadeId(unidadeId: string): Promise<Pedido[]> {
    const rows = await this.prisma.pedidoModel.findMany({
      where: { unidadeId },
      include: { itens: true },
      orderBy: { dataPedido: "desc" },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findAll(): Promise<Pedido[]> {
    const rows = await this.prisma.pedidoModel.findMany({
      include: { itens: true },
      orderBy: { dataPedido: "desc" },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async updateStatus(id: string, status: StatusPedido): Promise<void> {
    await this.prisma.pedidoModel.update({
      where: { id },
      data: { status },
    });
  }

  private toDomain(row: any): Pedido {
    const itens = (row.itens || []).map((item: any) =>
      ItemPedido.reconstitute(item.id, item.pedidoId, item.vasilhameId, item.quantidade, item.precoUnitario.toNumber())
    );
    return Pedido.reconstitute(
      row.id, row.clienteId, row.unidadeId,
      row.status as StatusPedido, row.tipoPagamento as TipoPagamento,
      row.valorTotal.toNumber(), row.dataPedido, row.dataEntregaPrevista, itens
    );
  }
}
