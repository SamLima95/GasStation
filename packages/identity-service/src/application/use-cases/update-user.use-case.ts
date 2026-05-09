import { Email } from "../../domain/value-objects/email.vo";
import type { IUserRepository } from "../ports/user-repository.port";
import type { ICacheService } from "@lframework/shared";
import type { UpdateUserDto } from "../dtos/update-user.dto";
import type { UserResponseDto } from "../dtos/user-response.dto";
import { InvalidEmailError, UserAlreadyExistsError, UserNotFoundError } from "../errors";

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly cache: ICacheService
  ) {}

  async execute(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundError("User not found");
    }

    let email: Email | undefined;
    if (dto.email !== undefined) {
      try {
        email = Email.create(dto.email);
      } catch {
        throw new InvalidEmailError("Invalid email");
      }

      const existing = await this.userRepository.findByEmail(email.value);
      if (existing && existing.id !== id) {
        throw new UserAlreadyExistsError("User with this email already exists");
      }
    }

    user.updateProfile({ email, name: dto.name, role: dto.role });
    await this.userRepository.save(user);
    await this.cache.delete(`user:${id}`);

    return {
      id: user.id,
      email: user.email.value,
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
