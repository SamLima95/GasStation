import { randomUUID } from "crypto";
import { UsuarioUnidade } from "../../domain/entities/usuario-unidade.entity";
import type { IUsuarioUnidadeRepository } from "../ports/usuario-unidade-repository.port";
import type { IUnidadeRepository } from "../ports/unidade-repository.port";
import type { IUserRepository } from "../ports/user-repository.port";
import type { LinkUserToUnidadeDto, UsuarioUnidadeResponseDto } from "../dtos/usuario-unidade.dto";
import { UnidadeNotFoundError, UserAlreadyLinkedError, UserNotFoundError } from "../errors";

export class LinkUserToUnidadeUseCase {
  constructor(
    private readonly usuarioUnidadeRepository: IUsuarioUnidadeRepository,
    private readonly unidadeRepository: IUnidadeRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(dto: LinkUserToUnidadeDto): Promise<UsuarioUnidadeResponseDto> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) throw new UserNotFoundError();

    const unidade = await this.unidadeRepository.findById(dto.unidadeId);
    if (!unidade) throw new UnidadeNotFoundError();

    const existing = await this.usuarioUnidadeRepository.findByUserAndUnidade(dto.userId, dto.unidadeId);
    if (existing) throw new UserAlreadyLinkedError();

    const id = randomUUID();
    const vu = UsuarioUnidade.create(id, dto.userId, dto.unidadeId, dto.nivel);
    await this.usuarioUnidadeRepository.save(vu);

    return {
      id: vu.id,
      userId: vu.userId,
      unidadeId: vu.unidadeId,
      nivel: vu.nivel,
      createdAt: vu.createdAt.toISOString(),
    };
  }
}
