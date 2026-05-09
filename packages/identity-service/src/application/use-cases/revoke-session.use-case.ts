import type { IAuthSessionRepository } from "../ports/auth-session-repository.port";
import { SessionNotFoundError } from "../errors";

export class RevokeSessionUseCase {
  constructor(private readonly sessionRepository: IAuthSessionRepository) {}

  async execute(input: { userId: string; sessionId: string }): Promise<void> {
    const session = await this.sessionRepository.findById(input.sessionId);
    if (!session || session.userId !== input.userId) {
      throw new SessionNotFoundError("Session not found");
    }
    await this.sessionRepository.revoke(input.sessionId, new Date());
  }
}
