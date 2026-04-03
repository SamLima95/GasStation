import { PrismaClient } from "../../../../generated/prisma-client";
import { Entrega } from "../../../domain/entities/entrega.entity";
import { StatusEntrega } from "../../../domain/types";
import type { IEntregaRepository } from "../../../application/ports/entrega-repository.port";

export class PrismaEntregaRepository implements IEntregaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(e: Entrega): Promise<void> {
    await this.prisma.entregaModel.create({ data: { id: e.id, rotaId: e.rotaId, pedidoId: e.pedidoId, status: e.status, dataConfirmacao: e.dataConfirmacao } });
  }
  async findById(id: string): Promise<Entrega | null> {
    const r = await this.prisma.entregaModel.findUnique({ where: { id } });
    return r ? Entrega.reconstitute(r.id, r.rotaId, r.pedidoId, r.status as StatusEntrega, r.dataConfirmacao) : null;
  }
  async findByRotaId(rotaId: string): Promise<Entrega[]> {
    const rows = await this.prisma.entregaModel.findMany({ where: { rotaId } });
    return rows.map((r) => Entrega.reconstitute(r.id, r.rotaId, r.pedidoId, r.status as StatusEntrega, r.dataConfirmacao));
  }
  async findByStatus(status: StatusEntrega): Promise<Entrega[]> {
    const rows = await this.prisma.entregaModel.findMany({ where: { status } });
    return rows.map((r) => Entrega.reconstitute(r.id, r.rotaId, r.pedidoId, r.status as StatusEntrega, r.dataConfirmacao));
  }
  async findByRotaUnidadeId(unidadeId: string): Promise<Entrega[]> {
    const rows = await this.prisma.entregaModel.findMany({ where: { rota: { unidadeId } } });
    return rows.map((r) => Entrega.reconstitute(r.id, r.rotaId, r.pedidoId, r.status as StatusEntrega, r.dataConfirmacao));
  }
  async findAll(): Promise<Entrega[]> {
    const rows = await this.prisma.entregaModel.findMany();
    return rows.map((r) => Entrega.reconstitute(r.id, r.rotaId, r.pedidoId, r.status as StatusEntrega, r.dataConfirmacao));
  }
  async update(e: Entrega): Promise<void> {
    await this.prisma.entregaModel.update({ where: { id: e.id }, data: { rotaId: e.rotaId, status: e.status, dataConfirmacao: e.dataConfirmacao } });
  }
}
