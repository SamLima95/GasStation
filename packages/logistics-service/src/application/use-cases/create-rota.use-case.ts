import { randomUUID } from "crypto";
import { Rota } from "../../domain/entities/rota.entity";
import type { IRotaRepository } from "../ports/rota-repository.port";
import type { IEntregadorRepository } from "../ports/entregador-repository.port";
import type { IVeiculoRepository } from "../ports/veiculo-repository.port";
import type { CreateRotaDto } from "../dtos/create-rota.dto";
import type { RotaResponseDto } from "../dtos/rota-response.dto";
import { EntregadorNotFoundError, VeiculoNotFoundError, InvalidRotaError } from "../errors";

export class CreateRotaUseCase {
  constructor(
    private readonly rotaRepository: IRotaRepository,
    private readonly entregadorRepository: IEntregadorRepository,
    private readonly veiculoRepository: IVeiculoRepository
  ) {}

  async execute(dto: CreateRotaDto): Promise<RotaResponseDto> {
    const entregador = await this.entregadorRepository.findById(dto.entregadorId);
    if (!entregador || !entregador.ativo) throw new EntregadorNotFoundError(`Entregador ${dto.entregadorId} not found or inactive`);
    if (entregador.unidadeId !== dto.unidadeId) throw new InvalidRotaError("Entregador does not belong to this unidade");

    const veiculo = await this.veiculoRepository.findById(dto.veiculoId);
    if (!veiculo || !veiculo.ativo) throw new VeiculoNotFoundError(`Veiculo ${dto.veiculoId} not found or inactive`);
    if (veiculo.unidadeId !== dto.unidadeId) throw new InvalidRotaError("Veiculo does not belong to this unidade");

    try {
      const rota = Rota.create(randomUUID(), dto.unidadeId, dto.entregadorId, dto.veiculoId, new Date(dto.dataRota));
      await this.rotaRepository.save(rota);
      return { id: rota.id, unidadeId: rota.unidadeId, entregadorId: rota.entregadorId, veiculoId: rota.veiculoId, dataRota: rota.dataRota.toISOString(), status: rota.status };
    } catch (err) {
      if (err instanceof EntregadorNotFoundError || err instanceof VeiculoNotFoundError || err instanceof InvalidRotaError) throw err;
      throw new InvalidRotaError(err instanceof Error ? err.message : "Invalid rota");
    }
  }
}
