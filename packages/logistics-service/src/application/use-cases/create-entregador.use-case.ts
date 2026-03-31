import { randomUUID } from "crypto";
import { Entregador } from "../../domain/entities/entregador.entity";
import type { IEntregadorRepository } from "../ports/entregador-repository.port";
import type { CreateEntregadorDto } from "../dtos/create-entregador.dto";
import type { EntregadorResponseDto } from "../dtos/entregador-response.dto";
import { InvalidEntregadorError } from "../errors";

export class CreateEntregadorUseCase {
  constructor(private readonly entregadorRepository: IEntregadorRepository) {}
  async execute(dto: CreateEntregadorDto): Promise<EntregadorResponseDto> {
    try {
      const e = Entregador.create(randomUUID(), dto.nome, dto.documento, dto.unidadeId);
      await this.entregadorRepository.save(e);
      return { id: e.id, nome: e.nome, documento: e.documento, ativo: e.ativo, unidadeId: e.unidadeId };
    } catch (err) { throw new InvalidEntregadorError(err instanceof Error ? err.message : "Invalid entregador"); }
  }
}
