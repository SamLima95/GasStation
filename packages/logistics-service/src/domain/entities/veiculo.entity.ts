export class Veiculo {
  private constructor(
    private readonly _id: string, private _placa: string, private _modelo: string,
    private _ativo: boolean, private readonly _unidadeId: string
  ) {}

  static create(id: string, placa: string, modelo: string, unidadeId: string): Veiculo {
    if (!placa || placa.trim().length === 0) throw new Error("Placa is required");
    if (!modelo || modelo.trim().length === 0) throw new Error("Modelo is required");
    if (!unidadeId || unidadeId.trim().length === 0) throw new Error("UnidadeId is required");
    return new Veiculo(id, placa.trim(), modelo.trim(), true, unidadeId.trim());
  }

  static reconstitute(id: string, placa: string, modelo: string, ativo: boolean, unidadeId: string): Veiculo {
    return new Veiculo(id, placa, modelo, ativo, unidadeId);
  }

  desativar(): void { this._ativo = false; }
  ativar(): void { this._ativo = true; }

  get id(): string { return this._id; }
  get placa(): string { return this._placa; }
  get modelo(): string { return this._modelo; }
  get ativo(): boolean { return this._ativo; }
  get unidadeId(): string { return this._unidadeId; }
}
