import { PrismaClient } from "../../../../generated/prisma-client";
import { Rota } from "../../../domain/entities/rota.entity";
import { StatusRota } from "../../../domain/types";
import type { IRotaRepository } from "../../../application/ports/rota-repository.port";

export class PrismaRotaRepository implements IRotaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(r: Rota): Promise<void> {
    await this.prisma.rotaModel.create({ data: { id: r.id, unidadeId: r.unidadeId, entregadorId: r.entregadorId, veiculoId: r.veiculoId, dataRota: r.dataRota, status: r.status } });
  }
  async findById(id: string): Promise<Rota | null> {
    const r = await this.prisma.rotaModel.findUnique({ where: { id } });
    return r ? Rota.reconstitute(r.id, r.unidadeId, r.entregadorId, r.veiculoId, r.dataRota, r.status as StatusRota) : null;
  }
  async findByUnidadeId(unidadeId: string): Promise<Rota[]> {
    const rows = await this.prisma.rotaModel.findMany({ where: { unidadeId }, orderBy: { dataRota: "desc" } });
    return rows.map((r) => Rota.reconstitute(r.id, r.unidadeId, r.entregadorId, r.veiculoId, r.dataRota, r.status as StatusRota));
  }
  async findAll(): Promise<Rota[]> {
    const rows = await this.prisma.rotaModel.findMany({ orderBy: { dataRota: "desc" } });
    return rows.map((r) => Rota.reconstitute(r.id, r.unidadeId, r.entregadorId, r.veiculoId, r.dataRota, r.status as StatusRota));
  }
  async updateStatus(id: string, status: StatusRota): Promise<void> {
    await this.prisma.rotaModel.update({ where: { id }, data: { status } });
  }
}
