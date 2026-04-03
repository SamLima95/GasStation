/**
 * Entidade de domínio: Auditoria.
 * Imutável após criação — sem métodos de atualização.
 */
export class Auditoria {
  private constructor(
    private readonly _id: string,
    private readonly _servico: string,
    private readonly _entidade: string,
    private readonly _entidadeId: string,
    private readonly _acao: string,
    private readonly _usuarioId: string | null,
    private readonly _unidadeId: string | null,
    private readonly _detalhes: Record<string, unknown> | null,
    private readonly _occurredAt: Date,
    private readonly _createdAt: Date
  ) {}

  static create(
    id: string, servico: string, entidade: string, entidadeId: string,
    acao: string, usuarioId: string | null, unidadeId: string | null,
    detalhes: Record<string, unknown> | null, occurredAt: Date
  ): Auditoria {
    if (!servico || !entidade || !entidadeId || !acao) {
      throw new Error("Campos obrigatórios: servico, entidade, entidadeId, acao");
    }
    return new Auditoria(id, servico, entidade, entidadeId, acao, usuarioId, unidadeId, detalhes, occurredAt, new Date());
  }

  static reconstitute(
    id: string, servico: string, entidade: string, entidadeId: string,
    acao: string, usuarioId: string | null, unidadeId: string | null,
    detalhes: Record<string, unknown> | null, occurredAt: Date, createdAt: Date
  ): Auditoria {
    return new Auditoria(id, servico, entidade, entidadeId, acao, usuarioId, unidadeId, detalhes, occurredAt, createdAt);
  }

  get id(): string { return this._id; }
  get servico(): string { return this._servico; }
  get entidade(): string { return this._entidade; }
  get entidadeId(): string { return this._entidadeId; }
  get acao(): string { return this._acao; }
  get usuarioId(): string | null { return this._usuarioId; }
  get unidadeId(): string | null { return this._unidadeId; }
  get detalhes(): Record<string, unknown> | null { return this._detalhes; }
  get occurredAt(): Date { return this._occurredAt; }
  get createdAt(): Date { return this._createdAt; }
}
