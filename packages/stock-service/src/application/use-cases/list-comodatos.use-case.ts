import type { IComodatoRepository } from "../ports/comodato-repository.port";
import type { ComodatoResponseDto } from "../dtos/comodato-response.dto";

export class ListComodatosUseCase {
  constructor(private readonly comodatoRepository: IComodatoRepository) {}

  async execute(unidadeId?: string): Promise<ComodatoResponseDto[]> {
    const comodatos = unidadeId
      ? await this.comodatoRepository.findByUnidadeId(unidadeId)
      : await this.comodatoRepository.findAll();
    return comodatos.map((c) => ({
      id: c.id,
      clienteId: c.clienteId,
      unidadeId: c.unidadeId,
      vasilhameId: c.vasilhameId,
      saldoComodato: c.saldoComodato,
      atualizadoEm: c.atualizadoEm.toISOString(),
    }));
  }
}
