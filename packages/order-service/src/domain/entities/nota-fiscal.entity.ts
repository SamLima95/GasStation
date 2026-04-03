export type StatusNotaFiscal = "PENDENTE" | "AUTORIZADA" | "REJEITADA" | "FALHA";

export class NotaFiscal {
  private constructor(
    private readonly _id: string,
    private readonly _pedidoId: string,
    private _chaveAcesso: string | null,
    private _status: StatusNotaFiscal,
    private _tentativas: number,
    private _mensagem: string | null,
    private readonly _createdAt: Date
  ) {}

  static create(id: string, pedidoId: string): NotaFiscal {
    return new NotaFiscal(id, pedidoId, null, "PENDENTE", 0, null, new Date());
  }

  static reconstitute(
    id: string, pedidoId: string, chaveAcesso: string | null,
    status: StatusNotaFiscal, tentativas: number, mensagem: string | null, createdAt: Date
  ): NotaFiscal {
    return new NotaFiscal(id, pedidoId, chaveAcesso, status, tentativas, mensagem, createdAt);
  }

  autorizar(chaveAcesso: string): void {
    this._chaveAcesso = chaveAcesso;
    this._status = "AUTORIZADA";
    this._tentativas++;
  }

  rejeitar(mensagem: string): void {
    this._status = "REJEITADA";
    this._mensagem = mensagem;
    this._tentativas++;
  }

  registrarFalha(mensagem: string): void {
    this._status = "FALHA";
    this._mensagem = mensagem;
    this._tentativas++;
  }

  get id(): string { return this._id; }
  get pedidoId(): string { return this._pedidoId; }
  get chaveAcesso(): string | null { return this._chaveAcesso; }
  get status(): StatusNotaFiscal { return this._status; }
  get tentativas(): number { return this._tentativas; }
  get mensagem(): string | null { return this._mensagem; }
  get createdAt(): Date { return this._createdAt; }
}
