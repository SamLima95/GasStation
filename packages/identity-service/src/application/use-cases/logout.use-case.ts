import type { ICacheService } from "@lframework/shared";

export class LogoutUseCase {
  constructor(private readonly cache: ICacheService) {}

  async execute(input: { jti?: string; exp?: number }): Promise<void> {
    if (!input.jti) {
      return;
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const ttlSeconds = input.exp ? Math.max(input.exp - nowSeconds, 1) : 3600;
    await this.cache.set(`jwt:blacklist:${input.jti}`, true, ttlSeconds);
  }
}
