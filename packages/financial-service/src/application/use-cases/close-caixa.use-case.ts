import type { ICaixaRepository } from "../ports/caixa-repository.port";
import type { CaixaResponseDto } from "../dtos/caixa-response.dto";
import { CaixaNotFoundError, InvalidStatusTransitionError } from "../errors";

export class CloseCaixaUseCase {
  constructor(private readonly caixaRepository: ICaixaRepository) {}

  async execute(caixaId: string): Promise<CaixaResponseDto> {
    const caixa = await this.caixaRepository.findById(caixaId);
    if (!caixa) throw new CaixaNotFoundError(`Caixa ${caixaId} not found`);

    try { caixa.fechar(); } catch (err) {
      throw new InvalidStatusTransitionError(err instanceof Error ? err.message : "Invalid status transition");
    }

    await this.caixaRepository.update(caixa);
    return {
      id: caixa.id, unidadeId: caixa.unidadeId, dataAbertura: caixa.dataAbertura.toISOString(),
      dataFechamento: caixa.dataFechamento?.toISOString() ?? null, status: caixa.status,
      saldoInicial: caixa.saldoInicial, saldoFinal: caixa.saldoFinal,
    };
  }
}
