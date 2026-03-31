import { randomUUID } from "crypto";
import { Caixa } from "../../domain/entities/caixa.entity";
import type { ICaixaRepository } from "../ports/caixa-repository.port";
import type { OpenCaixaDto } from "../dtos/open-caixa.dto";
import type { CaixaResponseDto } from "../dtos/caixa-response.dto";
import { CaixaAlreadyOpenError, InvalidCaixaError } from "../errors";

export class OpenCaixaUseCase {
  constructor(private readonly caixaRepository: ICaixaRepository) {}

  async execute(dto: OpenCaixaDto): Promise<CaixaResponseDto> {
    const existing = await this.caixaRepository.findOpenByUnidadeId(dto.unidadeId);
    if (existing) throw new CaixaAlreadyOpenError(`Já existe caixa aberto para unidade ${dto.unidadeId}`);

    const id = randomUUID();
    try {
      const caixa = Caixa.create(id, dto.unidadeId, dto.saldoInicial);
      await this.caixaRepository.save(caixa);
      return {
        id: caixa.id, unidadeId: caixa.unidadeId, dataAbertura: caixa.dataAbertura.toISOString(),
        dataFechamento: null, status: caixa.status, saldoInicial: caixa.saldoInicial, saldoFinal: caixa.saldoFinal,
      };
    } catch (err) {
      throw new InvalidCaixaError(err instanceof Error ? err.message : "Invalid caixa");
    }
  }
}
