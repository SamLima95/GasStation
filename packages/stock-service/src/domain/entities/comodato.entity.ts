/**
 * Entidade de domínio: Comodato (saldo de vasilhames em comodato por cliente/unidade).
 */
export class Comodato {
  private constructor(
    private readonly _id: string,
    private readonly _clienteId: string,
    private readonly _unidadeId: string,
    private readonly _vasilhameId: string,
    private _saldoComodato: number,
    private _atualizadoEm: Date
  ) {}

  static create(
    id: string,
    clienteId: string,
    unidadeId: string,
    vasilhameId: string,
    saldoComodato: number
  ): Comodato {
    if (!clienteId || clienteId.trim().length === 0) {
      throw new Error("ClienteId is required");
    }
    if (!unidadeId || unidadeId.trim().length === 0) {
      throw new Error("UnidadeId is required");
    }
    if (!vasilhameId || vasilhameId.trim().length === 0) {
      throw new Error("VasilhameId is required");
    }
    if (saldoComodato < 0) {
      throw new Error("SaldoComodato cannot be negative");
    }
    return new Comodato(id, clienteId.trim(), unidadeId.trim(), vasilhameId.trim(), saldoComodato, new Date());
  }

  static reconstitute(
    id: string,
    clienteId: string,
    unidadeId: string,
    vasilhameId: string,
    saldoComodato: number,
    atualizadoEm: Date
  ): Comodato {
    return new Comodato(id, clienteId, unidadeId, vasilhameId, saldoComodato, atualizadoEm);
  }

  get id(): string { return this._id; }
  get clienteId(): string { return this._clienteId; }
  get unidadeId(): string { return this._unidadeId; }
  get vasilhameId(): string { return this._vasilhameId; }
  get saldoComodato(): number { return this._saldoComodato; }
  get atualizadoEm(): Date { return this._atualizadoEm; }

  adjustSaldo(delta: number): void {
    const newSaldo = this._saldoComodato + delta;
    if (newSaldo < 0) {
      throw new Error("SaldoComodato cannot become negative");
    }
    this._saldoComodato = newSaldo;
    this._atualizadoEm = new Date();
  }
}
