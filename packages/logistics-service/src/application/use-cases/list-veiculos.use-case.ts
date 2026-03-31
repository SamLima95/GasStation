import type { IVeiculoRepository } from "../ports/veiculo-repository.port";
import type { VeiculoResponseDto } from "../dtos/veiculo-response.dto";

export class ListVeiculosUseCase {
  constructor(private readonly veiculoRepository: IVeiculoRepository) {}
  async execute(): Promise<VeiculoResponseDto[]> {
    const list = await this.veiculoRepository.findAll();
    return list.map((v) => ({ id: v.id, placa: v.placa, modelo: v.modelo, ativo: v.ativo, unidadeId: v.unidadeId }));
  }
}
