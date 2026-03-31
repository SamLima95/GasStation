import { randomUUID } from "crypto";
import { ContaAReceber } from "../../domain/entities/conta-a-receber.entity";
import type { IContaAReceberRepository } from "../ports/conta-a-receber-repository.port";
import type { CreateContaAReceberDto } from "../dtos/create-conta-a-receber.dto";
import type { ContaAReceberResponseDto } from "../dtos/conta-a-receber-response.dto";
import { InvalidContaAReceberError } from "../errors";

export class CreateContaAReceberUseCase {
  constructor(private readonly contaAReceberRepository: IContaAReceberRepository) {}

  async execute(dto: CreateContaAReceberDto): Promise<ContaAReceberResponseDto> {
    const id = randomUUID();
    try {
      const conta = ContaAReceber.create(id, dto.pedidoId, dto.clienteId, dto.valorOriginal, new Date(dto.vencimento));
      await this.contaAReceberRepository.save(conta);
      return {
        id: conta.id, pedidoId: conta.pedidoId, clienteId: conta.clienteId, caixaId: conta.caixaId,
        valorOriginal: conta.valorOriginal, valorAberto: conta.valorAberto, status: conta.status,
        vencimento: conta.vencimento.toISOString(), createdAt: conta.createdAt.toISOString(),
      };
    } catch (err) {
      throw new InvalidContaAReceberError(err instanceof Error ? err.message : "Invalid conta a receber");
    }
  }
}
