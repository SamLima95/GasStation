import { randomUUID } from "crypto";
import { Veiculo } from "../../domain/entities/veiculo.entity";
import type { IVeiculoRepository } from "../ports/veiculo-repository.port";
import type { CreateVeiculoDto } from "../dtos/create-veiculo.dto";
import type { VeiculoResponseDto } from "../dtos/veiculo-response.dto";
import { InvalidVeiculoError } from "../errors";

export class CreateVeiculoUseCase {
  constructor(private readonly veiculoRepository: IVeiculoRepository) {}
  async execute(dto: CreateVeiculoDto): Promise<VeiculoResponseDto> {
    const existing = await this.veiculoRepository.findByPlaca(dto.placa);
    if (existing) throw new InvalidVeiculoError(`Placa ${dto.placa} já cadastrada`);
    try {
      const v = Veiculo.create(randomUUID(), dto.placa, dto.modelo, dto.unidadeId);
      await this.veiculoRepository.save(v);
      return { id: v.id, placa: v.placa, modelo: v.modelo, ativo: v.ativo, unidadeId: v.unidadeId };
    } catch (err) { throw new InvalidVeiculoError(err instanceof Error ? err.message : "Invalid veiculo"); }
  }
}
