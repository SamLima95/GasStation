import { PrismaClient } from "../../../../generated/prisma-client";
import { Vasilhame } from "../../../domain/entities/vasilhame.entity";
import type { IVasilhameRepository } from "../../../application/ports/vasilhame-repository.port";

export class PrismaVasilhameRepository implements IVasilhameRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(vasilhame: Vasilhame): Promise<void> {
    await this.prisma.vasilhameModel.upsert({
      where: { id: vasilhame.id },
      create: {
        id: vasilhame.id,
        tipo: vasilhame.tipo,
        descricao: vasilhame.descricao,
        capacidade: vasilhame.capacidade,
        createdAt: vasilhame.createdAt,
      },
      update: {
        tipo: vasilhame.tipo,
        descricao: vasilhame.descricao,
        capacidade: vasilhame.capacidade,
      },
    });
  }

  async findById(id: string): Promise<Vasilhame | null> {
    const row = await this.prisma.vasilhameModel.findUnique({ where: { id } });
    if (!row) return null;
    return Vasilhame.reconstitute(row.id, row.tipo, row.descricao, row.capacidade, row.createdAt);
  }

  async findAll(): Promise<Vasilhame[]> {
    const rows = await this.prisma.vasilhameModel.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((row) =>
      Vasilhame.reconstitute(row.id, row.tipo, row.descricao, row.capacidade, row.createdAt)
    );
  }
}
