import { PrismaClient } from "../../../../generated/prisma-client";
import { Auditoria } from "../../../domain/entities/auditoria.entity";
import type { IAuditoriaRepository } from "../../../application/ports/auditoria-repository.port";
import type { AuditoriaFilterDto } from "../../../application/dtos/auditoria.dto";

export class PrismaAuditoriaRepository implements IAuditoriaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(auditoria: Auditoria): Promise<void> {
    await this.prisma.auditoriaModel.create({
      data: {
        id: auditoria.id,
        servico: auditoria.servico,
        entidade: auditoria.entidade,
        entidadeId: auditoria.entidadeId,
        acao: auditoria.acao,
        usuarioId: auditoria.usuarioId,
        unidadeId: auditoria.unidadeId,
        detalhes: auditoria.detalhes as object ?? undefined,
        occurredAt: auditoria.occurredAt,
        createdAt: auditoria.createdAt,
      },
    });
  }

  async findWithFilters(filters: AuditoriaFilterDto): Promise<Auditoria[]> {
    const where: Record<string, unknown> = {};
    if (filters.servico) where.servico = filters.servico;
    if (filters.entidade) where.entidade = filters.entidade;
    if (filters.entidadeId) where.entidadeId = filters.entidadeId;
    if (filters.acao) where.acao = filters.acao;
    if (filters.usuarioId) where.usuarioId = filters.usuarioId;
    if (filters.unidadeId) where.unidadeId = filters.unidadeId;
    if (filters.dataInicio || filters.dataFim) {
      const occurredAt: Record<string, Date> = {};
      if (filters.dataInicio) occurredAt.gte = new Date(filters.dataInicio);
      if (filters.dataFim) occurredAt.lte = new Date(filters.dataFim);
      where.occurredAt = occurredAt;
    }

    const rows = await this.prisma.auditoriaModel.findMany({
      where,
      orderBy: { occurredAt: "desc" },
      take: 500,
    });

    return rows.map((r) =>
      Auditoria.reconstitute(
        r.id, r.servico, r.entidade, r.entidadeId, r.acao,
        r.usuarioId, r.unidadeId,
        r.detalhes as Record<string, unknown> | null,
        r.occurredAt, r.createdAt
      )
    );
  }

  async findByEntidade(entidade: string, entidadeId: string): Promise<Auditoria[]> {
    const rows = await this.prisma.auditoriaModel.findMany({
      where: { entidade, entidadeId },
      orderBy: { occurredAt: "desc" },
    });

    return rows.map((r) =>
      Auditoria.reconstitute(
        r.id, r.servico, r.entidade, r.entidadeId, r.acao,
        r.usuarioId, r.unidadeId,
        r.detalhes as Record<string, unknown> | null,
        r.occurredAt, r.createdAt
      )
    );
  }
}
