import { StatusCaixa } from "../types";

export class Caixa {
  private constructor(
    private readonly _id: string,
    private readonly _unidadeId: string,
    private readonly _dataAbertura: Date,
    private _dataFechamento: Date | null,
    private _status: StatusCaixa,
    private readonly _saldoInicial: number,
    private _saldoFinal: number | null
  ) {}

  static create(id: string, unidadeId: string, saldoInicial: number): Caixa {
    if (!unidadeId || unidadeId.trim().length === 0) throw new Error("UnidadeId is required");
    if (saldoInicial < 0) throw new Error("SaldoInicial cannot be negative");
    return new Caixa(id, unidadeId.trim(), new Date(), null, StatusCaixa.ABERTO, saldoInicial, null);
  }

  static reconstitute(id: string, unidadeId: string, dataAbertura: Date, dataFechamento: Date | null, status: StatusCaixa, saldoInicial: number, saldoFinal: number | null): Caixa {
    return new Caixa(id, unidadeId, dataAbertura, dataFechamento, status, saldoInicial, saldoFinal);
  }

  fechar(): void {
    if (this._status !== StatusCaixa.ABERTO) throw new Error("Cannot close a caixa that is not ABERTO");
    this._status = StatusCaixa.FECHADO;
    this._dataFechamento = new Date();
    if (this._saldoFinal === null) this._saldoFinal = this._saldoInicial;
  }

  adicionarRecebimento(valor: number): void {
    if (this._status !== StatusCaixa.ABERTO) throw new Error("Cannot add to closed caixa");
    this._saldoFinal = (this._saldoFinal ?? this._saldoInicial) + valor;
  }

  get id(): string { return this._id; }
  get unidadeId(): string { return this._unidadeId; }
  get dataAbertura(): Date { return this._dataAbertura; }
  get dataFechamento(): Date | null { return this._dataFechamento; }
  get status(): StatusCaixa { return this._status; }
  get saldoInicial(): number { return this._saldoInicial; }
  get saldoFinal(): number | null { return this._saldoFinal; }
}
