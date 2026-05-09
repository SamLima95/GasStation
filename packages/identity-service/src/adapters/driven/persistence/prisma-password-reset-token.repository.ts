import { PrismaClient } from "../../../../generated/prisma-client";
import type {
  IPasswordResetTokenRepository,
  PasswordResetTokenRecord,
} from "../../../application/ports/password-reset-token-repository.port";

export class PrismaPasswordResetTokenRepository implements IPasswordResetTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
  }): Promise<void> {
    await this.prisma.passwordResetTokenModel.create({ data: input });
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetTokenRecord | null> {
    return this.prisma.passwordResetTokenModel.findUnique({ where: { tokenHash } });
  }

  async markUsed(id: string, usedAt: Date): Promise<void> {
    await this.prisma.passwordResetTokenModel.update({
      where: { id },
      data: { usedAt },
    });
  }

  async deleteOpenTokensForUser(userId: string): Promise<void> {
    await this.prisma.passwordResetTokenModel.deleteMany({
      where: { userId, usedAt: null },
    });
  }
}
