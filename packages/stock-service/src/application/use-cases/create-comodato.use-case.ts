import { randomUUID } from "crypto";
import { Comodato } from "../../domain/entities/comodato.entity";
import type { IComodatoRepository } from "../ports/comodato-repository.port";
import type { IVasilhameRepository } from "../ports/vasilhame-repository.port";
import type { CreateComodatoDto } from "../dtos/create-comodato.dto";
import type { ComodatoResponseDto } from "../dtos/comodato-response.dto";
import { InvalidComodatoError, VasilhameNotFoundError } from "../errors";

export class CreateComodatoUseCase {
  constructor(
    private readonly comodatoRepository: IComodatoRepository,
    private readonly vasilhameRepository: IVasilhameRepository
  ) {}

  async execute(dto: CreateComodatoDto): Promise<ComodatoResponseDto> {
    const vasilhame = await this.vasilhameRepository.findById(dto.vasilhameId);
    if (!vasilhame) {
      throw new VasilhameNotFoundError(`Vasilhame ${dto.vasilhameId} not found`);
    }

    const id = randomUUID();
    try {
      const comodato = Comodato.create(id, dto.clienteId, dto.unidadeId, dto.vasilhameId, dto.saldoComodato);
      await this.comodatoRepository.upsert(comodato);

      const result: ComodatoResponseDto = {
        id: comodato.id,
        clienteId: comodato.clienteId,
        unidadeId: comodato.unidadeId,
        vasilhameId: comodato.vasilhameId,
        saldoComodato: comodato.saldoComodato,
        atualizadoEm: comodato.atualizadoEm.toISOString(),
      };
      return result;
    } catch (err) {
      if (err instanceof VasilhameNotFoundError) throw err;
      throw new InvalidComodatoError(err instanceof Error ? err.message : "Invalid comodato");
    }
  }
}
