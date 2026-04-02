import type { IUsuarioUnidadeRepository } from "../ports/usuario-unidade-repository.port";
import type { UsuarioUnidadeResponseDto } from "../dtos/usuario-unidade.dto";

export class ListUserUnidadesUseCase {
  constructor(private readonly usuarioUnidadeRepository: IUsuarioUnidadeRepository) {}

  async execute(userId: string): Promise<UsuarioUnidadeResponseDto[]> {
    const vinculos = await this.usuarioUnidadeRepository.findByUserId(userId);
    return vinculos.map((v) => ({
      id: v.id,
      userId: v.userId,
      unidadeId: v.unidadeId,
      nivel: v.nivel,
      createdAt: v.createdAt.toISOString(),
    }));
  }
}
