import { Prisma, PrismaClient } from "../../../../generated/prisma-client";
import { ContaAReceber } from "../../../domain/entities/conta-a-receber.entity";
import { StatusContaAReceber } from "../../../domain/types";
import type { IContaAReceberRepository } from "../../../application/ports/conta-a-receber-repository.port";

export class PrismaContaAReceberRepository implements IContaAReceberRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(conta: ContaAReceber): Promise<void> {
    await this.prisma.contaAReceberModel.create({
      data: {
        id: conta.id, pedidoId: conta.pedidoId, clienteId: conta.clienteId, caixaId: conta.caixaId,
        valorOriginal: new Prisma.Decimal(conta.valorOriginal), valorAberto: new Prisma.Decimal(conta.valorAberto),
        status: conta.status, vencimento: conta.vencimento, createdAt: conta.createdAt,
      },
    });
  }

  async findById(id: string): Promise<ContaAReceber | null> {
    const r = await this.prisma.contaAReceberModel.findUnique({ where: { id } });
    if (!r) return null;
    return ContaAReceber.reconstitute(r.id, r.pedidoId, r.clienteId, r.caixaId, r.valorOriginal.toNumber(), r.valorAberto.toNumber(), r.status as StatusContaAReceber, r.vencimento, r.createdAt);
  }

  async findByClienteId(clienteId: string): Promise<ContaAReceber[]> {
    const rows = await this.prisma.contaAReceberModel.findMany({ where: { clienteId }, orderBy: { createdAt: "desc" } });
    return rows.map((r) => ContaAReceber.reconstitute(r.id, r.pedidoId, r.clienteId, r.caixaId, r.valorOriginal.toNumber(), r.valorAberto.toNumber(), r.status as StatusContaAReceber, r.vencimento, r.createdAt));
  }

  async findAll(): Promise<ContaAReceber[]> {
    const rows = await this.prisma.contaAReceberModel.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((r) => ContaAReceber.reconstitute(r.id, r.pedidoId, r.clienteId, r.caixaId, r.valorOriginal.toNumber(), r.valorAberto.toNumber(), r.status as StatusContaAReceber, r.vencimento, r.createdAt));
  }

  async update(conta: ContaAReceber): Promise<void> {
    await this.prisma.contaAReceberModel.update({
      where: { id: conta.id },
      data: { valorAberto: new Prisma.Decimal(conta.valorAberto), status: conta.status, caixaId: conta.caixaId },
    });
  }
}
