import type { IClienteRepository } from "../ports/cliente-repository.port";
import type { ICacheService } from "@lframework/shared";
import { clienteResponseDtoSchema, type ClienteResponseDto } from "../dtos/cliente-response.dto";
import { z } from "zod";

const CACHE_TTL = 60;
const clientesListCacheSchema = z.array(clienteResponseDtoSchema);

export class ListClientesUseCase {
  constructor(
    private readonly clienteRepository: IClienteRepository,
    private readonly cache: ICacheService
  ) {}

  async execute(unidadeId?: string): Promise<ClienteResponseDto[]> {
    const cacheKey = unidadeId ? `clientes:list:${unidadeId}` : "clientes:list";
    const cached = await this.cache.get(cacheKey, clientesListCacheSchema);
    if (cached) return cached;

    const clientes = unidadeId
      ? await this.clienteRepository.findByUnidadeId(unidadeId)
      : await this.clienteRepository.findAll();
    const dtos: ClienteResponseDto[] = clientes.map((c) => ({
      id: c.id,
      nome: c.nome,
      documento: c.documento,
      limiteCredito: c.limiteCredito,
      saldoDevedor: c.saldoDevedor,
      unidadeId: c.unidadeId,
      createdAt: c.createdAt.toISOString(),
    }));

    await this.cache.set(cacheKey, dtos, CACHE_TTL);
    return dtos;
  }
}
