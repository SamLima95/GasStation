import { StatusContaAReceber } from "../types";

export class ContaAReceber {
  private constructor(
    private readonly _id: string,
    private readonly _pedidoId: string,
    private readonly _clienteId: string,
    private _caixaId: string | null,
    private readonly _valorOriginal: number,
    private _valorAberto: number,
    private _status: StatusContaAReceber,
    private readonly _vencimento: Date,
    private readonly _createdAt: Date
  ) {}

  static create(id: string, pedidoId: string, clienteId: string, valorOriginal: number, vencimento: Date): ContaAReceber {
    if (!pedidoId || pedidoId.trim().length === 0) throw new Error("PedidoId is required");
    if (!clienteId || clienteId.trim().length === 0) throw new Error("ClienteId is required");
    if (valorOriginal <= 0) throw new Error("ValorOriginal must be positive");
    return new ContaAReceber(id, pedidoId.trim(), clienteId.trim(), null, valorOriginal, valorOriginal, StatusContaAReceber.PENDENTE, vencimento, new Date());
  }

  static reconstitute(id: string, pedidoId: string, clienteId: string, caixaId: string | null, valorOriginal: number, valorAberto: number, status: StatusContaAReceber, vencimento: Date, createdAt: Date): ContaAReceber {
    return new ContaAReceber(id, pedidoId, clienteId, caixaId, valorOriginal, valorAberto, status, vencimento, createdAt);
  }

  registrarPagamento(valor: number, caixaId: string): void {
    if (valor <= 0) throw new Error("Valor must be positive");
    if (valor > this._valorAberto) throw new Error("Valor exceeds valor_aberto");
    if (this._status === StatusContaAReceber.PAGO) throw new Error("Conta already fully paid");
    this._valorAberto -= valor;
    this._caixaId = caixaId;
    this._status = this._valorAberto === 0 ? StatusContaAReceber.PAGO : StatusContaAReceber.PAGO_PARCIAL;
  }

  isVencida(): boolean {
    return this._status !== StatusContaAReceber.PAGO && new Date() > this._vencimento;
  }

  get id(): string { return this._id; }
  get pedidoId(): string { return this._pedidoId; }
  get clienteId(): string { return this._clienteId; }
  get caixaId(): string | null { return this._caixaId; }
  get valorOriginal(): number { return this._valorOriginal; }
  get valorAberto(): number { return this._valorAberto; }
  get status(): StatusContaAReceber { return this._status; }
  get vencimento(): Date { return this._vencimento; }
  get createdAt(): Date { return this._createdAt; }
}
