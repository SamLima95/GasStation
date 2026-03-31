/**
 * Entidade de domínio: Vasilhame (tipo de vasilhame/botijão).
 */
export class Vasilhame {
  private constructor(
    private readonly _id: string,
    private _tipo: string,
    private _descricao: string,
    private _capacidade: number,
    private readonly _createdAt: Date
  ) {}

  static create(id: string, tipo: string, descricao: string, capacidade: number): Vasilhame {
    if (!tipo || tipo.trim().length === 0) {
      throw new Error("Tipo is required");
    }
    if (!descricao || descricao.trim().length === 0) {
      throw new Error("Descricao is required");
    }
    if (capacidade <= 0) {
      throw new Error("Capacidade must be positive");
    }
    return new Vasilhame(id, tipo.trim(), descricao.trim(), capacidade, new Date());
  }

  static reconstitute(
    id: string,
    tipo: string,
    descricao: string,
    capacidade: number,
    createdAt: Date
  ): Vasilhame {
    return new Vasilhame(id, tipo, descricao, capacidade, createdAt);
  }

  get id(): string { return this._id; }
  get tipo(): string { return this._tipo; }
  get descricao(): string { return this._descricao; }
  get capacidade(): number { return this._capacidade; }
  get createdAt(): Date { return this._createdAt; }
}
