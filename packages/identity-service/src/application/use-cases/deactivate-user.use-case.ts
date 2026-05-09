import type { IUserRepository } from "../ports/user-repository.port";
import type { ICacheService } from "@lframework/shared";
import { UserNotFoundError } from "../errors";

export class DeactivateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly cache: ICacheService
  ) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundError("User not found");
    }

    user.deactivate();
    await this.userRepository.save(user);
    await this.cache.delete(`user:${id}`);
  }
}
