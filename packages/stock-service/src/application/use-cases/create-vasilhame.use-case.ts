import { randomUUID } from "crypto";
import { Vasilhame } from "../../domain/entities/vasilhame.entity";
import type { IVasilhameRepository } from "../ports/vasilhame-repository.port";
import type { IVasilhamesListCacheInvalidator } from "../ports/vasilhames-list-cache-invalidator.port";
import type { CreateVasilhameDto } from "../dtos/create-vasilhame.dto";
import type { VasilhameResponseDto } from "../dtos/vasilhame-response.dto";
import { InvalidVasilhameError } from "../errors";

export class CreateVasilhameUseCase {
  constructor(
    private readonly vasilhameRepository: IVasilhameRepository,
    private readonly vasilhamesListCacheInvalidator: IVasilhamesListCacheInvalidator
  ) {}

  async execute(dto: CreateVasilhameDto): Promise<VasilhameResponseDto> {
    const id = randomUUID();
    try {
      const vasilhame = Vasilhame.create(id, dto.tipo, dto.descricao, dto.capacidade);
      await this.vasilhameRepository.save(vasilhame);

      await this.vasilhamesListCacheInvalidator.invalidate();

      const result: VasilhameResponseDto = {
        id: vasilhame.id,
        tipo: vasilhame.tipo,
        descricao: vasilhame.descricao,
        capacidade: vasilhame.capacidade,
        createdAt: vasilhame.createdAt.toISOString(),
      };
      return result;
    } catch (err) {
      throw new InvalidVasilhameError(err instanceof Error ? err.message : "Invalid vasilhame");
    }
  }
}
