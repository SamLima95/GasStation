import { Prisma, PrismaClient } from "../../../../generated/prisma-client";
import { Caixa } from "../../../domain/entities/caixa.entity";
import { StatusCaixa } from "../../../domain/types";
import type { ICaixaRepository } from "../../../application/ports/caixa-repository.port";

export class PrismaCaixaRepository implements ICaixaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(caixa: Caixa): Promise<void> {
    await this.prisma.caixaModel.create({
      data: { id: caixa.id, unidadeId: caixa.unidadeId, dataAbertura: caixa.dataAbertura, status: caixa.status, saldoInicial: new Prisma.Decimal(caixa.saldoInicial) },
    });
  }

  async findById(id: string): Promise<Caixa | null> {
    const row = await this.prisma.caixaModel.findUnique({ where: { id } });
    if (!row) return null;
    return Caixa.reconstitute(row.id, row.unidadeId, row.dataAbertura, row.dataFechamento, row.status as StatusCaixa, row.saldoInicial.toNumber(), row.saldoFinal?.toNumber() ?? null);
  }

  async findOpenByUnidadeId(unidadeId: string): Promise<Caixa | null> {
    const row = await this.prisma.caixaModel.findFirst({ where: { unidadeId, status: "ABERTO" } });
    if (!row) return null;
    return Caixa.reconstitute(row.id, row.unidadeId, row.dataAbertura, row.dataFechamento, row.status as StatusCaixa, row.saldoInicial.toNumber(), row.saldoFinal?.toNumber() ?? null);
  }

  async findByUnidadeId(unidadeId: string): Promise<Caixa[]> {
    const rows = await this.prisma.caixaModel.findMany({ where: { unidadeId }, orderBy: { dataAbertura: "desc" } });
    return rows.map((r) => Caixa.reconstitute(r.id, r.unidadeId, r.dataAbertura, r.dataFechamento, r.status as StatusCaixa, r.saldoInicial.toNumber(), r.saldoFinal?.toNumber() ?? null));
  }

  async findAll(): Promise<Caixa[]> {
    const rows = await this.prisma.caixaModel.findMany({ orderBy: { dataAbertura: "desc" } });
    return rows.map((r) => Caixa.reconstitute(r.id, r.unidadeId, r.dataAbertura, r.dataFechamento, r.status as StatusCaixa, r.saldoInicial.toNumber(), r.saldoFinal?.toNumber() ?? null));
  }

  async update(caixa: Caixa): Promise<void> {
    await this.prisma.caixaModel.update({
      where: { id: caixa.id },
      data: { status: caixa.status, dataFechamento: caixa.dataFechamento, saldoFinal: caixa.saldoFinal !== null ? new Prisma.Decimal(caixa.saldoFinal) : null },
    });
  }
}
