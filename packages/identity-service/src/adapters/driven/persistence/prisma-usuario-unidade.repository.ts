import { Prisma, PrismaClient } from "../../../../generated/prisma-client";
import { UsuarioUnidade } from "../../../domain/entities/usuario-unidade.entity";
import type { NivelAcesso } from "../../../domain/types";
import type { IUsuarioUnidadeRepository } from "../../../application/ports/usuario-unidade-repository.port";
import { UserAlreadyLinkedError } from "../../../application/errors";

function isPrismaP2002(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

export class PrismaUsuarioUnidadeRepository implements IUsuarioUnidadeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(vu: UsuarioUnidade): Promise<void> {
    try {
      await this.prisma.usuarioUnidadeModel.create({
        data: {
          id: vu.id,
          userId: vu.userId,
          unidadeId: vu.unidadeId,
          nivel: vu.nivel,
          createdAt: vu.createdAt,
        },
      });
    } catch (err) {
      if (isPrismaP2002(err)) {
        throw new UserAlreadyLinkedError();
      }
      throw err;
    }
  }

  async findByUserId(userId: string): Promise<UsuarioUnidade[]> {
    const rows = await this.prisma.usuarioUnidadeModel.findMany({ where: { userId } });
    return rows.map((r) =>
      UsuarioUnidade.reconstitute(r.id, r.userId, r.unidadeId, r.nivel as NivelAcesso, r.createdAt)
    );
  }

  async findByUnidadeId(unidadeId: string): Promise<UsuarioUnidade[]> {
    const rows = await this.prisma.usuarioUnidadeModel.findMany({ where: { unidadeId } });
    return rows.map((r) =>
      UsuarioUnidade.reconstitute(r.id, r.userId, r.unidadeId, r.nivel as NivelAcesso, r.createdAt)
    );
  }

  async findByUserAndUnidade(userId: string, unidadeId: string): Promise<UsuarioUnidade | null> {
    const row = await this.prisma.usuarioUnidadeModel.findUnique({
      where: { userId_unidadeId: { userId, unidadeId } },
    });
    if (!row) return null;
    return UsuarioUnidade.reconstitute(row.id, row.userId, row.unidadeId, row.nivel as NivelAcesso, row.createdAt);
  }
}
