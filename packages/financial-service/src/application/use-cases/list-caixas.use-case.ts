import type { ICaixaRepository } from "../ports/caixa-repository.port";
import type { CaixaResponseDto } from "../dtos/caixa-response.dto";

export class ListCaixasUseCase {
  constructor(private readonly caixaRepository: ICaixaRepository) {}

  async execute(): Promise<CaixaResponseDto[]> {
    const caixas = await this.caixaRepository.findAll();
    return caixas.map((c) => ({
      id: c.id, unidadeId: c.unidadeId, dataAbertura: c.dataAbertura.toISOString(),
      dataFechamento: c.dataFechamento?.toISOString() ?? null, status: c.status,
      saldoInicial: c.saldoInicial, saldoFinal: c.saldoFinal,
    }));
  }
}
