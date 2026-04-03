import { PrismaClient } from "../../../../generated/prisma-client";
import { Comodato } from "../../../domain/entities/comodato.entity";
import type { IComodatoRepository } from "../../../application/ports/comodato-repository.port";

export class PrismaComodatoRepository implements IComodatoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(comodato: Comodato): Promise<void> {
    await this.prisma.comodatoModel.create({
      data: {
        id: comodato.id,
        clienteId: comodato.clienteId,
        unidadeId: comodato.unidadeId,
        vasilhameId: comodato.vasilhameId,
        saldoComodato: comodato.saldoComodato,
        atualizadoEm: comodato.atualizadoEm,
      },
    });
  }

  async findById(id: string): Promise<Comodato | null> {
    const row = await this.prisma.comodatoModel.findUnique({ where: { id } });
    if (!row) return null;
    return Comodato.reconstitute(
      row.id, row.clienteId, row.unidadeId, row.vasilhameId, row.saldoComodato, row.atualizadoEm
    );
  }

  async findByClienteId(clienteId: string): Promise<Comodato[]> {
    const rows = await this.prisma.comodatoModel.findMany({
      where: { clienteId },
      orderBy: { atualizadoEm: "desc" },
    });
    return rows.map((row) =>
      Comodato.reconstitute(
        row.id, row.clienteId, row.unidadeId, row.vasilhameId, row.saldoComodato, row.atualizadoEm
      )
    );
  }

  async upsert(comodato: Comodato): Promise<void> {
    await this.prisma.comodatoModel.upsert({
      where: {
        clienteId_unidadeId_vasilhameId: {
          clienteId: comodato.clienteId,
          unidadeId: comodato.unidadeId,
          vasilhameId: comodato.vasilhameId,
        },
      },
      create: {
        id: comodato.id,
        clienteId: comodato.clienteId,
        unidadeId: comodato.unidadeId,
        vasilhameId: comodato.vasilhameId,
        saldoComodato: comodato.saldoComodato,
        atualizadoEm: comodato.atualizadoEm,
      },
      update: {
        saldoComodato: comodato.saldoComodato,
        atualizadoEm: comodato.atualizadoEm,
      },
    });
  }

  async findByUnidadeId(unidadeId: string): Promise<Comodato[]> {
    const rows = await this.prisma.comodatoModel.findMany({
      where: { unidadeId },
      orderBy: { atualizadoEm: "desc" },
    });
    return rows.map((row) =>
      Comodato.reconstitute(
        row.id, row.clienteId, row.unidadeId, row.vasilhameId, row.saldoComodato, row.atualizadoEm
      )
    );
  }

  async findAll(): Promise<Comodato[]> {
    const rows = await this.prisma.comodatoModel.findMany({
      orderBy: { atualizadoEm: "desc" },
    });
    return rows.map((row) =>
      Comodato.reconstitute(
        row.id, row.clienteId, row.unidadeId, row.vasilhameId, row.saldoComodato, row.atualizadoEm
      )
    );
  }
}
