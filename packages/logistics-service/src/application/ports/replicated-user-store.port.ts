import type { UserCreatedPayload } from "@lframework/shared";
export interface IReplicatedUserStore { upsertFromUserCreated(payload: UserCreatedPayload): Promise<void>; }
