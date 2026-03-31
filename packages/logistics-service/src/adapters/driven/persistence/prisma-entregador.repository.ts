import { PrismaClient } from "../../../../generated/prisma-client";
import { Entregador } from "../../../domain/entities/entregador.entity";
import type { IEntregadorRepository } from "../../../application/ports/entregador-repository.port";

export class PrismaEntregadorRepository implements IEntregadorRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(e: Entregador): Promise<void> {
    await this.prisma.entregadorModel.create({ data: { id: e.id, nome: e.nome, documento: e.documento, ativo: e.ativo, unidadeId: e.unidadeId } });
  }
  async findById(id: string): Promise<Entregador | null> {
    const r = await this.prisma.entregadorModel.findUnique({ where: { id } });
    return r ? Entregador.reconstitute(r.id, r.nome, r.documento, r.ativo, r.unidadeId) : null;
  }
  async findByUnidadeId(unidadeId: string): Promise<Entregador[]> {
    const rows = await this.prisma.entregadorModel.findMany({ where: { unidadeId } });
    return rows.map((r) => Entregador.reconstitute(r.id, r.nome, r.documento, r.ativo, r.unidadeId));
  }
  async findAll(): Promise<Entregador[]> {
    const rows = await this.prisma.entregadorModel.findMany();
    return rows.map((r) => Entregador.reconstitute(r.id, r.nome, r.documento, r.ativo, r.unidadeId));
  }
  async update(e: Entregador): Promise<void> {
    await this.prisma.entregadorModel.update({ where: { id: e.id }, data: { nome: e.nome, documento: e.documento, ativo: e.ativo } });
  }
}
