import type { IEntregaRepository } from "../ports/entrega-repository.port";
import type { IRotaRepository } from "../ports/rota-repository.port";
import type { EntregaResponseDto } from "../dtos/entrega-response.dto";
import { EntregaNotFoundError, RotaNotFoundError, InvalidEntregaError } from "../errors";

export class AssignEntregaUseCase {
  constructor(
    private readonly entregaRepository: IEntregaRepository,
    private readonly rotaRepository: IRotaRepository
  ) {}

  async execute(entregaId: string, rotaId: string): Promise<EntregaResponseDto> {
    const entrega = await this.entregaRepository.findById(entregaId);
    if (!entrega) throw new EntregaNotFoundError(`Entrega ${entregaId} not found`);

    const rota = await this.rotaRepository.findById(rotaId);
    if (!rota) throw new RotaNotFoundError(`Rota ${rotaId} not found`);

    try { entrega.atribuirRota(rotaId); } catch (err) {
      throw new InvalidEntregaError(err instanceof Error ? err.message : "Cannot assign rota");
    }

    await this.entregaRepository.update(entrega);
    return { id: entrega.id, rotaId: entrega.rotaId, pedidoId: entrega.pedidoId, status: entrega.status, dataConfirmacao: entrega.dataConfirmacao?.toISOString() ?? null };
  }
}
