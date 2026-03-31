import type { IVasilhameRepository } from "../ports/vasilhame-repository.port";
import type { ICacheService } from "@lframework/shared";
import { vasilhameResponseDtoSchema, type VasilhameResponseDto } from "../dtos/vasilhame-response.dto";
import { z } from "zod";

const CACHE_KEY = "vasilhames:list";
const CACHE_TTL = 60;
const vasilhamesListCacheSchema = z.array(vasilhameResponseDtoSchema);

export class ListVasilhamesUseCase {
  constructor(
    private readonly vasilhameRepository: IVasilhameRepository,
    private readonly cache: ICacheService
  ) {}

  async execute(): Promise<VasilhameResponseDto[]> {
    const cached = await this.cache.get(CACHE_KEY, vasilhamesListCacheSchema);
    if (cached) {
      return cached;
    }

    const vasilhames = await this.vasilhameRepository.findAll();
    const dtos: VasilhameResponseDto[] = vasilhames.map((v) => ({
      id: v.id,
      tipo: v.tipo,
      descricao: v.descricao,
      capacidade: v.capacidade,
      createdAt: v.createdAt.toISOString(),
    }));

    await this.cache.set(CACHE_KEY, dtos, CACHE_TTL);
    return dtos;
  }
}
