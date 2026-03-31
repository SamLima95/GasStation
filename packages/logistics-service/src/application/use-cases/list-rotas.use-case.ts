import type { IRotaRepository } from "../ports/rota-repository.port";
import type { RotaResponseDto } from "../dtos/rota-response.dto";

export class ListRotasUseCase {
  constructor(private readonly rotaRepository: IRotaRepository) {}
  async execute(): Promise<RotaResponseDto[]> {
    const list = await this.rotaRepository.findAll();
    return list.map((r) => ({ id: r.id, unidadeId: r.unidadeId, entregadorId: r.entregadorId, veiculoId: r.veiculoId, dataRota: r.dataRota.toISOString(), status: r.status }));
  }
}
