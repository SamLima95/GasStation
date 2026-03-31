/**
 * Entidade de domínio: Cliente (cliente da distribuidora).
 */
export class Cliente {
  private constructor(
    private readonly _id: string,
    private _nome: string,
    private _documento: string,
    private _limiteCredito: number,
    private _saldoDevedor: number,
    private readonly _unidadeId: string,
    private readonly _createdAt: Date
  ) {}

  static create(
    id: string,
    nome: string,
    documento: string,
    limiteCredito: number,
    unidadeId: string
  ): Cliente {
    if (!nome || nome.trim().length === 0) {
      throw new Error("Nome is required");
    }
    if (!documento || documento.trim().length === 0) {
      throw new Error("Documento is required");
    }
    if (limiteCredito < 0) {
      throw new Error("LimiteCredito cannot be negative");
    }
    if (!unidadeId || unidadeId.trim().length === 0) {
      throw new Error("UnidadeId is required");
    }
    return new Cliente(id, nome.trim(), documento.trim(), limiteCredito, 0, unidadeId.trim(), new Date());
  }

  static reconstitute(
    id: string,
    nome: string,
    documento: string,
    limiteCredito: number,
    saldoDevedor: number,
    unidadeId: string,
    createdAt: Date
  ): Cliente {
    return new Cliente(id, nome, documento, limiteCredito, saldoDevedor, unidadeId, createdAt);
  }

  /** RN11: Verifica se o cliente pode assumir mais dívida a prazo. */
  verificarLimiteCredito(valorPedido: number): boolean {
    return (this._saldoDevedor + valorPedido) <= this._limiteCredito;
  }

  adicionarSaldoDevedor(valor: number): void {
    const novoSaldo = this._saldoDevedor + valor;
    if (novoSaldo > this._limiteCredito) {
      throw new Error("Saldo devedor excederia o limite de crédito");
    }
    this._saldoDevedor = novoSaldo;
  }

  get id(): string { return this._id; }
  get nome(): string { return this._nome; }
  get documento(): string { return this._documento; }
  get limiteCredito(): number { return this._limiteCredito; }
  get saldoDevedor(): number { return this._saldoDevedor; }
  get unidadeId(): string { return this._unidadeId; }
  get createdAt(): Date { return this._createdAt; }
}
