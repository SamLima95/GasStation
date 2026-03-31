import type { IEntregaRepository } from "../ports/entrega-repository.port";
import type { EntregaResponseDto } from "../dtos/entrega-response.dto";

export class ListEntregasUseCase {
  constructor(private readonly entregaRepository: IEntregaRepository) {}
  async execute(): Promise<EntregaResponseDto[]> {
    const list = await this.entregaRepository.findAll();
    return list.map((e) => ({ id: e.id, rotaId: e.rotaId, pedidoId: e.pedidoId, status: e.status, dataConfirmacao: e.dataConfirmacao?.toISOString() ?? null }));
  }
}
