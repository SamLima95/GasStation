import type { IUserRepository } from "../ports/user-repository.port";
import type { IAuthCredentialRepository } from "../ports/auth-credential-repository.port";
import type { IPasswordHasher } from "../ports/password-hasher.port";
import type { ITokenService } from "../ports/token-service.port";
import type { IAuthSessionRepository } from "../ports/auth-session-repository.port";
import type { LoginDto } from "../dtos/login.dto";
import type { AuthUserDto } from "../dtos/auth-response.dto";
import { InvalidCredentialsError } from "../errors";
import { createRefreshToken, expiresFromNow, hashRefreshToken } from "./session-token";

export interface LoginResultDto {
  user: AuthUserDto;
  accessToken: string;
  refreshToken: string;
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authCredentialRepository: IAuthCredentialRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
    private readonly sessionRepository: IAuthSessionRepository,
    private readonly refreshTokenTtlSeconds: number
  ) {}

  async execute(dto: LoginDto, context: { userAgent?: string | null; ipAddress?: string | null } = {}): Promise<LoginResultDto> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new InvalidCredentialsError("Invalid email or password");
    }
    if (user.status !== "active") {
      throw new InvalidCredentialsError("Invalid email or password");
    }

    const hash = await this.authCredentialRepository.getPasswordHashByUserId(user.id);
    if (!hash) {
      throw new InvalidCredentialsError("Invalid email or password");
    }

    const valid = await this.passwordHasher.verify(dto.password, hash);
    if (!valid) {
      throw new InvalidCredentialsError("Invalid email or password");
    }

    const refreshToken = createRefreshToken();
    const session = await this.sessionRepository.create({
      userId: user.id,
      refreshTokenHash: hashRefreshToken(refreshToken),
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      expiresAt: expiresFromNow(this.refreshTokenTtlSeconds),
    });

    const accessToken = this.tokenService.sign({
      sub: user.id,
      email: user.email.value,
      role: user.role,
      sid: session.id,
    });

    return {
      user: {
        id: user.id,
        email: user.email.value,
        name: user.name,
      },
      accessToken,
      refreshToken,
    };
  }
}
