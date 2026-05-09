import type { PrismaClient } from "../../../../generated/prisma-client";
import type {
  AuthSession,
  CreateAuthSessionInput,
  IAuthSessionRepository,
} from "../../../application/ports/auth-session-repository.port";

export class PrismaAuthSessionRepository implements IAuthSessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateAuthSessionInput): Promise<AuthSession> {
    return this.prisma.authSessionModel.create({
      data: {
        userId: input.userId,
        refreshTokenHash: input.refreshTokenHash,
        userAgent: input.userAgent ?? null,
        ipAddress: input.ipAddress ?? null,
        createdAt: new Date(),
        expiresAt: input.expiresAt,
      },
    });
  }

  async findActiveByRefreshTokenHash(refreshTokenHash: string, now: Date): Promise<AuthSession | null> {
    return this.prisma.authSessionModel.findFirst({
      where: {
        refreshTokenHash,
        revokedAt: null,
        expiresAt: { gt: now },
      },
    });
  }

  async findById(id: string): Promise<AuthSession | null> {
    return this.prisma.authSessionModel.findUnique({ where: { id } });
  }

  async listByUserId(userId: string): Promise<AuthSession[]> {
    return this.prisma.authSessionModel.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async replaceRefreshToken(sessionId: string, refreshTokenHash: string, expiresAt: Date, now: Date): Promise<AuthSession> {
    return this.prisma.authSessionModel.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash,
        expiresAt,
        lastUsedAt: now,
      },
    });
  }

  async revoke(sessionId: string, now: Date): Promise<void> {
    await this.prisma.authSessionModel.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: now },
    });
  }

  async revokeAllForUser(userId: string, now: Date): Promise<void> {
    await this.prisma.authSessionModel.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: now },
    });
  }

  async isActive(sessionId: string, now: Date): Promise<boolean> {
    const count = await this.prisma.authSessionModel.count({
      where: {
        id: sessionId,
        revokedAt: null,
        expiresAt: { gt: now },
      },
    });
    return count > 0;
  }
}
