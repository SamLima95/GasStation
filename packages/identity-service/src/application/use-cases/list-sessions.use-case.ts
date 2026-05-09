import type { AuthSession, IAuthSessionRepository } from "../ports/auth-session-repository.port";

export interface SessionDto {
  id: string;
  userId: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
  lastUsedAt: string | null;
  active: boolean;
}

export class ListSessionsUseCase {
  constructor(private readonly sessionRepository: IAuthSessionRepository) {}

  async execute(userId: string): Promise<SessionDto[]> {
    const now = new Date();
    const sessions = await this.sessionRepository.listByUserId(userId);
    return sessions.map((session) => this.toDto(session, now));
  }

  private toDto(session: AuthSession, now: Date): SessionDto {
    return {
      id: session.id,
      userId: session.userId,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
      revokedAt: session.revokedAt?.toISOString() ?? null,
      lastUsedAt: session.lastUsedAt?.toISOString() ?? null,
      active: !session.revokedAt && session.expiresAt > now,
    };
  }
}
