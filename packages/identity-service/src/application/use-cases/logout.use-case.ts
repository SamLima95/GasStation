import type { ICacheService } from "@lframework/shared";
import type { IAuthSessionRepository } from "../ports/auth-session-repository.port";

export class LogoutUseCase {
  constructor(
    private readonly cache: ICacheService,
    private readonly sessionRepository?: IAuthSessionRepository
  ) {}

  async execute(input: { jti?: string; exp?: number; sessionId?: string }): Promise<void> {
    if (input.sessionId && this.sessionRepository) {
      await this.sessionRepository.revoke(input.sessionId, new Date());
    }

    if (input.jti) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const ttlSeconds = input.exp ? Math.max(input.exp - nowSeconds, 1) : 3600;
      await this.cache.set(`jwt:blacklist:${input.jti}`, true, ttlSeconds);
    }
  }
}
