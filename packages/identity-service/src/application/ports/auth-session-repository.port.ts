export interface AuthSession {
  id: string;
  userId: string;
  refreshTokenHash: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  lastUsedAt: Date | null;
}

export interface CreateAuthSessionInput {
  userId: string;
  refreshTokenHash: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  expiresAt: Date;
}

export interface IAuthSessionRepository {
  create(input: CreateAuthSessionInput): Promise<AuthSession>;
  findActiveByRefreshTokenHash(refreshTokenHash: string, now: Date): Promise<AuthSession | null>;
  findById(id: string): Promise<AuthSession | null>;
  listByUserId(userId: string): Promise<AuthSession[]>;
  replaceRefreshToken(sessionId: string, refreshTokenHash: string, expiresAt: Date, now: Date): Promise<AuthSession>;
  revoke(sessionId: string, now: Date): Promise<void>;
  revokeAllForUser(userId: string, now: Date): Promise<void>;
  isActive(sessionId: string, now: Date): Promise<boolean>;
}
