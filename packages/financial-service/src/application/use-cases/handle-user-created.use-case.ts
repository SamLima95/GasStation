import type { UserCreatedPayload } from "@lframework/shared";
import { logger } from "@lframework/shared";
import type { ICacheService } from "@lframework/shared";
import type { IReplicatedUserStore } from "../ports/replicated-user-store.port";

export class HandleUserCreatedUseCase {
  constructor(
    private readonly replicatedUserStore: IReplicatedUserStore,
    private readonly cache: ICacheService
  ) {}

  async execute(payload: UserCreatedPayload): Promise<void> {
    logger.info({ userId: payload.userId }, "UserCreated received");
    await this.replicatedUserStore.upsertFromUserCreated(payload);
    await this.cache.delete(`user:${payload.userId}`);
  }
}
