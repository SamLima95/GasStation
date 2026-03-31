import type { IContaAReceberRepository } from "../ports/conta-a-receber-repository.port";
import type { ContaAReceberResponseDto } from "../dtos/conta-a-receber-response.dto";

export class ListContasAReceberUseCase {
  constructor(private readonly contaAReceberRepository: IContaAReceberRepository) {}

  async execute(): Promise<ContaAReceberResponseDto[]> {
    const contas = await this.contaAReceberRepository.findAll();
    return contas.map((c) => ({
      id: c.id, pedidoId: c.pedidoId, clienteId: c.clienteId, caixaId: c.caixaId,
      valorOriginal: c.valorOriginal, valorAberto: c.valorAberto, status: c.status,
      vencimento: c.vencimento.toISOString(), createdAt: c.createdAt.toISOString(),
    }));
  }
}
