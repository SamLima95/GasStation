import type { NivelAcesso } from "../types";

/**
 * Entidade de domínio: UsuarioUnidade — vínculo entre usuário e unidade com nível de acesso.
 * Identidade: id. Invariante: (userId, unidadeId) é único.
 */
export class UsuarioUnidade {
  private static readonly NIVEIS_VALIDOS: NivelAcesso[] = ["operador", "gerente", "admin_holding"];

  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _unidadeId: string,
    private _nivel: NivelAcesso,
    private readonly _createdAt: Date
  ) {}

  static create(id: string, userId: string, unidadeId: string, nivel: NivelAcesso = "operador"): UsuarioUnidade {
    if (!userId || userId.trim().length === 0) {
      throw new Error("userId é obrigatório");
    }
    if (!unidadeId || unidadeId.trim().length === 0) {
      throw new Error("unidadeId é obrigatório");
    }
    if (!UsuarioUnidade.NIVEIS_VALIDOS.includes(nivel)) {
      throw new Error(`Nível inválido: ${nivel}`);
    }
    return new UsuarioUnidade(id, userId, unidadeId, nivel, new Date());
  }

  static reconstitute(id: string, userId: string, unidadeId: string, nivel: NivelAcesso, createdAt: Date): UsuarioUnidade {
    return new UsuarioUnidade(id, userId, unidadeId, nivel, createdAt);
  }

  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get unidadeId(): string { return this._unidadeId; }
  get nivel(): NivelAcesso { return this._nivel; }
  get createdAt(): Date { return this._createdAt; }
}
