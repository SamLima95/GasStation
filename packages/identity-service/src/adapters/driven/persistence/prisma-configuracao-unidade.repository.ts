import { randomUUID } from "crypto";
import { PrismaClient } from "../../../../generated/prisma-client";
import type { IConfiguracaoUnidadeRepository } from "../../../application/ports/configuracao-unidade-repository.port";
import type { ConfiguracaoUnidadeResponseDto } from "../../../application/dtos/configuracao-unidade.dto";

export class PrismaConfiguracaoUnidadeRepository implements IConfiguracaoUnidadeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsert(unidadeId: string, chave: string, valor: string): Promise<ConfiguracaoUnidadeResponseDto> {
    const row = await this.prisma.configuracaoUnidadeModel.upsert({
      where: { unidadeId_chave: { unidadeId, chave } },
      create: {
        id: randomUUID(),
        unidadeId,
        chave,
        valor,
        createdAt: new Date(),
      },
      update: { valor },
    });

    return {
      id: row.id,
      unidadeId: row.unidadeId,
      chave: row.chave,
      valor: row.valor,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async findByUnidadeId(unidadeId: string): Promise<ConfiguracaoUnidadeResponseDto[]> {
    const rows = await this.prisma.configuracaoUnidadeModel.findMany({
      where: { unidadeId },
      orderBy: { chave: "asc" },
    });
    return rows.map((r) => ({
      id: r.id,
      unidadeId: r.unidadeId,
      chave: r.chave,
      valor: r.valor,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async findByChave(unidadeId: string, chave: string): Promise<ConfiguracaoUnidadeResponseDto | null> {
    const row = await this.prisma.configuracaoUnidadeModel.findUnique({
      where: { unidadeId_chave: { unidadeId, chave } },
    });
    if (!row) return null;
    return {
      id: row.id,
      unidadeId: row.unidadeId,
      chave: row.chave,
      valor: row.valor,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
