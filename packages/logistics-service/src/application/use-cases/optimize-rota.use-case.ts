import type { IEntregaRepository } from "../ports/entrega-repository.port";
import type { IRotaRepository } from "../ports/rota-repository.port";
import type { IRouteOptimizer } from "../ports/route-optimizer.port";
import type { EntregaResponseDto } from "../dtos/entrega-response.dto";
import { RotaNotFoundError } from "../errors";

export class OptimizeRotaUseCase {
  constructor(
    private readonly entregaRepository: IEntregaRepository,
    private readonly rotaRepository: IRotaRepository,
    private readonly routeOptimizer: IRouteOptimizer
  ) {}

  async execute(rotaId: string): Promise<EntregaResponseDto[]> {
    const rota = await this.rotaRepository.findById(rotaId);
    if (!rota) throw new RotaNotFoundError(`Rota ${rotaId} não encontrada`);

    const entregas = await this.entregaRepository.findByRotaId(rotaId);
    if (entregas.length === 0) return [];

    const optimized = await this.routeOptimizer.optimize(entregas);

    return optimized.map((e) => ({
      id: e.id,
      rotaId: e.rotaId,
      pedidoId: e.pedidoId,
      status: e.status,
      dataConfirmacao: e.dataConfirmacao?.toISOString() ?? null,
    }));
  }
}
