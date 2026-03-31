import { PrismaClient } from "../../../../generated/prisma-client";
import { Veiculo } from "../../../domain/entities/veiculo.entity";
import type { IVeiculoRepository } from "../../../application/ports/veiculo-repository.port";

export class PrismaVeiculoRepository implements IVeiculoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(v: Veiculo): Promise<void> {
    await this.prisma.veiculoModel.create({ data: { id: v.id, placa: v.placa, modelo: v.modelo, ativo: v.ativo, unidadeId: v.unidadeId } });
  }
  async findById(id: string): Promise<Veiculo | null> {
    const r = await this.prisma.veiculoModel.findUnique({ where: { id } });
    return r ? Veiculo.reconstitute(r.id, r.placa, r.modelo, r.ativo, r.unidadeId) : null;
  }
  async findByPlaca(placa: string): Promise<Veiculo | null> {
    const r = await this.prisma.veiculoModel.findUnique({ where: { placa } });
    return r ? Veiculo.reconstitute(r.id, r.placa, r.modelo, r.ativo, r.unidadeId) : null;
  }
  async findByUnidadeId(unidadeId: string): Promise<Veiculo[]> {
    const rows = await this.prisma.veiculoModel.findMany({ where: { unidadeId } });
    return rows.map((r) => Veiculo.reconstitute(r.id, r.placa, r.modelo, r.ativo, r.unidadeId));
  }
  async findAll(): Promise<Veiculo[]> {
    const rows = await this.prisma.veiculoModel.findMany();
    return rows.map((r) => Veiculo.reconstitute(r.id, r.placa, r.modelo, r.ativo, r.unidadeId));
  }
  async update(v: Veiculo): Promise<void> {
    await this.prisma.veiculoModel.update({ where: { id: v.id }, data: { modelo: v.modelo, ativo: v.ativo } });
  }
}
