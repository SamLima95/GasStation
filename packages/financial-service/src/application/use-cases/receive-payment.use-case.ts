import type { ICaixaRepository } from "../ports/caixa-repository.port";
import type { IContaAReceberRepository } from "../ports/conta-a-receber-repository.port";
import type { IEventPublisher } from "../ports/event-publisher.port";
import type { ReceivePaymentDto } from "../dtos/receive-payment.dto";
import type { ContaAReceberResponseDto } from "../dtos/conta-a-receber-response.dto";
import { ContaAReceberNotFoundError, CaixaNotFoundError, InvalidCaixaError, InvalidPaymentError } from "../errors";
import { StatusCaixa } from "../../domain/types";
import { EXCHANGE_FINANCIAL_EVENTS, PAYMENT_RECEIVED_EVENT } from "@lframework/shared";

export class ReceivePaymentUseCase {
  constructor(
    private readonly contaAReceberRepository: IContaAReceberRepository,
    private readonly caixaRepository: ICaixaRepository,
    private readonly eventPublisher: IEventPublisher
  ) {}

  async execute(contaId: string, dto: ReceivePaymentDto): Promise<ContaAReceberResponseDto> {
    const conta = await this.contaAReceberRepository.findById(contaId);
    if (!conta) throw new ContaAReceberNotFoundError(`Conta ${contaId} not found`);

    const caixa = await this.caixaRepository.findById(dto.caixaId);
    if (!caixa) throw new CaixaNotFoundError(`Caixa ${dto.caixaId} not found`);
    if (caixa.status !== StatusCaixa.ABERTO) throw new InvalidCaixaError("Caixa is not open");

    try {
      conta.registrarPagamento(dto.valor, dto.caixaId);
      caixa.adicionarRecebimento(dto.valor);
    } catch (err) {
      throw new InvalidPaymentError(err instanceof Error ? err.message : "Invalid payment");
    }

    await this.contaAReceberRepository.update(conta);
    await this.caixaRepository.update(caixa);

    await this.eventPublisher.publish(EXCHANGE_FINANCIAL_EVENTS, PAYMENT_RECEIVED_EVENT, {
      contaAReceberId: conta.id, pedidoId: conta.pedidoId, clienteId: conta.clienteId,
      valor: dto.valor, valorAberto: conta.valorAberto, status: conta.status,
    });

    return {
      id: conta.id, pedidoId: conta.pedidoId, clienteId: conta.clienteId, caixaId: conta.caixaId,
      valorOriginal: conta.valorOriginal, valorAberto: conta.valorAberto, status: conta.status,
      vencimento: conta.vencimento.toISOString(), createdAt: conta.createdAt.toISOString(),
    };
  }
}
