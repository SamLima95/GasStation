import type { UserCreatedPayload } from "@lframework/shared";

export interface IEventConsumer {
  onUserCreated(handler: (payload: UserCreatedPayload) => Promise<void>): void;
}
