import type { TipoUnidade, StatusUnidade } from "../types";

/**
 * Entidade de domínio: Unidade (filial ou depósito).
 * Identidade: id.
 */
export class Unidade {
  private static readonly TIPOS_VALIDOS: TipoUnidade[] = ["filial", "deposito"];
  private static readonly STATUS_VALIDOS: StatusUnidade[] = ["ativa", "inativa"];

  private constructor(
    private readonly _id: string,
    private _nome: string,
    private _tipo: TipoUnidade,
    private _status: StatusUnidade,
    private readonly _createdAt: Date
  ) {}

  static create(id: string, nome: string, tipo: TipoUnidade, status: StatusUnidade = "ativa"): Unidade {
    if (!nome || nome.trim().length === 0) {
      throw new Error("Nome da unidade é obrigatório");
    }
    if (!Unidade.TIPOS_VALIDOS.includes(tipo)) {
      throw new Error(`Tipo inválido: ${tipo}`);
    }
    if (!Unidade.STATUS_VALIDOS.includes(status)) {
      throw new Error(`Status inválido: ${status}`);
    }
    return new Unidade(id, nome.trim(), tipo, status, new Date());
  }

  static reconstitute(id: string, nome: string, tipo: TipoUnidade, status: StatusUnidade, createdAt: Date): Unidade {
    return new Unidade(id, nome, tipo, status, createdAt);
  }

  get id(): string { return this._id; }
  get nome(): string { return this._nome; }
  get tipo(): TipoUnidade { return this._tipo; }
  get status(): StatusUnidade { return this._status; }
  get createdAt(): Date { return this._createdAt; }

  isAtiva(): boolean {
    return this._status === "ativa";
  }

  desativar(): void {
    this._status = "inativa";
  }

  ativar(): void {
    this._status = "ativa";
  }
}
