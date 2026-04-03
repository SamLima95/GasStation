import { PrismaClient } from "../../../../generated/prisma-client";
import { NotaFiscal } from "../../../domain/entities/nota-fiscal.entity";
import type { StatusNotaFiscal } from "../../../domain/entities/nota-fiscal.entity";
import type { INotaFiscalRepository } from "../../../application/ports/nota-fiscal-repository.port";

export class PrismaNotaFiscalRepository implements INotaFiscalRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(nf: NotaFiscal): Promise<void> {
    await this.prisma.notaFiscalModel.create({
      data: {
        id: nf.id, pedidoId: nf.pedidoId, chaveAcesso: nf.chaveAcesso,
        status: nf.status, tentativas: nf.tentativas, mensagem: nf.mensagem,
        createdAt: nf.createdAt,
      },
    });
  }

  async findByPedidoId(pedidoId: string): Promise<NotaFiscal | null> {
    const row = await this.prisma.notaFiscalModel.findFirst({
      where: { pedidoId },
      orderBy: { createdAt: "desc" },
    });
    if (!row) return null;
    return NotaFiscal.reconstitute(
      row.id, row.pedidoId, row.chaveAcesso, row.status as StatusNotaFiscal,
      row.tentativas, row.mensagem, row.createdAt
    );
  }

  async update(nf: NotaFiscal): Promise<void> {
    await this.prisma.notaFiscalModel.update({
      where: { id: nf.id },
      data: { chaveAcesso: nf.chaveAcesso, status: nf.status, tentativas: nf.tentativas, mensagem: nf.mensagem },
    });
  }
}
