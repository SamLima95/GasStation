import { PrismaClient } from "../../../../generated/prisma-client";
import { Unidade } from "../../../domain/entities/unidade.entity";
import type { TipoUnidade, StatusUnidade } from "../../../domain/types";
import type { IUnidadeRepository } from "../../../application/ports/unidade-repository.port";

export class PrismaUnidadeRepository implements IUnidadeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(unidade: Unidade): Promise<void> {
    await this.prisma.unidadeModel.upsert({
      where: { id: unidade.id },
      create: {
        id: unidade.id,
        nome: unidade.nome,
        tipo: unidade.tipo,
        status: unidade.status,
        createdAt: unidade.createdAt,
      },
      update: {
        nome: unidade.nome,
        tipo: unidade.tipo,
        status: unidade.status,
      },
    });
  }

  async findById(id: string): Promise<Unidade | null> {
    const row = await this.prisma.unidadeModel.findUnique({ where: { id } });
    if (!row) return null;
    return Unidade.reconstitute(
      row.id,
      row.nome,
      row.tipo as TipoUnidade,
      row.status as StatusUnidade,
      row.createdAt
    );
  }

  async findAll(): Promise<Unidade[]> {
    const rows = await this.prisma.unidadeModel.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((row) =>
      Unidade.reconstitute(
        row.id,
        row.nome,
        row.tipo as TipoUnidade,
        row.status as StatusUnidade,
        row.createdAt
      )
    );
  }
}
