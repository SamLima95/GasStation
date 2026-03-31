import { PrismaClient } from "../../../../generated/prisma-client";
import { MovimentacaoEstoque } from "../../../domain/entities/movimentacao-estoque.entity";
import { TipoMovimentacao } from "../../../domain/types";
import type { IMovimentacaoRepository } from "../../../application/ports/movimentacao-repository.port";

export class PrismaMovimentacaoRepository implements IMovimentacaoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(movimentacao: MovimentacaoEstoque): Promise<void> {
    await this.prisma.movimentacaoEstoqueModel.create({
      data: {
        id: movimentacao.id,
        unidadeId: movimentacao.unidadeId,
        vasilhameId: movimentacao.vasilhameId,
        usuarioId: movimentacao.usuarioId,
        pedidoId: movimentacao.pedidoId,
        tipoMovimentacao: movimentacao.tipoMovimentacao,
        quantidade: movimentacao.quantidade,
        dataHora: movimentacao.dataHora,
      },
    });
  }

  async findById(id: string): Promise<MovimentacaoEstoque | null> {
    const row = await this.prisma.movimentacaoEstoqueModel.findUnique({ where: { id } });
    if (!row) return null;
    return MovimentacaoEstoque.reconstitute(
      row.id, row.unidadeId, row.vasilhameId, row.usuarioId, row.pedidoId,
      row.tipoMovimentacao as TipoMovimentacao, row.quantidade, row.dataHora
    );
  }

  async findByUnidadeId(unidadeId: string): Promise<MovimentacaoEstoque[]> {
    const rows = await this.prisma.movimentacaoEstoqueModel.findMany({
      where: { unidadeId },
      orderBy: { dataHora: "desc" },
    });
    return rows.map((row) =>
      MovimentacaoEstoque.reconstitute(
        row.id, row.unidadeId, row.vasilhameId, row.usuarioId, row.pedidoId,
        row.tipoMovimentacao as TipoMovimentacao, row.quantidade, row.dataHora
      )
    );
  }

  async findAll(): Promise<MovimentacaoEstoque[]> {
    const rows = await this.prisma.movimentacaoEstoqueModel.findMany({
      orderBy: { dataHora: "desc" },
    });
    return rows.map((row) =>
      MovimentacaoEstoque.reconstitute(
        row.id, row.unidadeId, row.vasilhameId, row.usuarioId, row.pedidoId,
        row.tipoMovimentacao as TipoMovimentacao, row.quantidade, row.dataHora
      )
    );
  }
}
