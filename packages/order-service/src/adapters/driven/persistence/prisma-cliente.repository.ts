import { Prisma, PrismaClient } from "../../../../generated/prisma-client";
import { Cliente } from "../../../domain/entities/cliente.entity";
import type { IClienteRepository } from "../../../application/ports/cliente-repository.port";

export class PrismaClienteRepository implements IClienteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(cliente: Cliente): Promise<void> {
    await this.prisma.clienteModel.upsert({
      where: { id: cliente.id },
      create: {
        id: cliente.id,
        nome: cliente.nome,
        documento: cliente.documento,
        limiteCredito: new Prisma.Decimal(cliente.limiteCredito),
        saldoDevedor: new Prisma.Decimal(cliente.saldoDevedor),
        unidadeId: cliente.unidadeId,
        createdAt: cliente.createdAt,
      },
      update: {
        nome: cliente.nome,
        documento: cliente.documento,
        limiteCredito: new Prisma.Decimal(cliente.limiteCredito),
      },
    });
  }

  async findById(id: string): Promise<Cliente | null> {
    const row = await this.prisma.clienteModel.findUnique({ where: { id } });
    if (!row) return null;
    return Cliente.reconstitute(
      row.id, row.nome, row.documento,
      row.limiteCredito.toNumber(), row.saldoDevedor.toNumber(),
      row.unidadeId, row.createdAt
    );
  }

  async findByDocumento(documento: string): Promise<Cliente | null> {
    const row = await this.prisma.clienteModel.findUnique({ where: { documento } });
    if (!row) return null;
    return Cliente.reconstitute(
      row.id, row.nome, row.documento,
      row.limiteCredito.toNumber(), row.saldoDevedor.toNumber(),
      row.unidadeId, row.createdAt
    );
  }

  async findByUnidadeId(unidadeId: string): Promise<Cliente[]> {
    const rows = await this.prisma.clienteModel.findMany({
      where: { unidadeId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) =>
      Cliente.reconstitute(row.id, row.nome, row.documento, row.limiteCredito.toNumber(), row.saldoDevedor.toNumber(), row.unidadeId, row.createdAt)
    );
  }

  async findAll(): Promise<Cliente[]> {
    const rows = await this.prisma.clienteModel.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((row) =>
      Cliente.reconstitute(row.id, row.nome, row.documento, row.limiteCredito.toNumber(), row.saldoDevedor.toNumber(), row.unidadeId, row.createdAt)
    );
  }

  async updateSaldoDevedor(id: string, saldoDevedor: number): Promise<void> {
    await this.prisma.clienteModel.update({
      where: { id },
      data: { saldoDevedor: new Prisma.Decimal(saldoDevedor) },
    });
  }
}
