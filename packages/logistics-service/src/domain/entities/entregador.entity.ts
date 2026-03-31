export class Entregador {
  private constructor(
    private readonly _id: string, private _nome: string, private _documento: string,
    private _ativo: boolean, private readonly _unidadeId: string
  ) {}

  static create(id: string, nome: string, documento: string, unidadeId: string): Entregador {
    if (!nome || nome.trim().length === 0) throw new Error("Nome is required");
    if (!documento || documento.trim().length === 0) throw new Error("Documento is required");
    if (!unidadeId || unidadeId.trim().length === 0) throw new Error("UnidadeId is required");
    return new Entregador(id, nome.trim(), documento.trim(), true, unidadeId.trim());
  }

  static reconstitute(id: string, nome: string, documento: string, ativo: boolean, unidadeId: string): Entregador {
    return new Entregador(id, nome, documento, ativo, unidadeId);
  }

  desativar(): void { this._ativo = false; }
  ativar(): void { this._ativo = true; }

  get id(): string { return this._id; }
  get nome(): string { return this._nome; }
  get documento(): string { return this._documento; }
  get ativo(): boolean { return this._ativo; }
  get unidadeId(): string { return this._unidadeId; }
}
