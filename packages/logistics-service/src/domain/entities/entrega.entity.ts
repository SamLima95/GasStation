import { StatusEntrega } from "../types";

export class Entrega {
  private constructor(
    private readonly _id: string, private _rotaId: string | null,
    private readonly _pedidoId: string, private _status: StatusEntrega,
    private _dataConfirmacao: Date | null
  ) {}

  static create(id: string, pedidoId: string): Entrega {
    if (!pedidoId || pedidoId.trim().length === 0) throw new Error("PedidoId is required");
    return new Entrega(id, null, pedidoId.trim(), StatusEntrega.PENDENTE, null);
  }

  static reconstitute(id: string, rotaId: string | null, pedidoId: string, status: StatusEntrega, dataConfirmacao: Date | null): Entrega {
    return new Entrega(id, rotaId, pedidoId, status, dataConfirmacao);
  }

  atribuirRota(rotaId: string): void {
    if (this._status !== StatusEntrega.PENDENTE) throw new Error(`Cannot assign rota to entrega with status ${this._status}`);
    this._rotaId = rotaId;
  }

  iniciarTransito(): void {
    if (this._status !== StatusEntrega.PENDENTE) throw new Error(`Cannot start transit with status ${this._status}`);
    if (!this._rotaId) throw new Error("Cannot start transit without assigned rota");
    this._status = StatusEntrega.EM_TRANSITO;
  }

  confirmar(): void {
    if (this._status !== StatusEntrega.EM_TRANSITO) throw new Error(`Cannot confirm entrega with status ${this._status}`);
    this._status = StatusEntrega.ENTREGUE;
    this._dataConfirmacao = new Date();
  }

  registrarFalha(): void {
    if (this._status !== StatusEntrega.EM_TRANSITO) throw new Error(`Cannot register failure with status ${this._status}`);
    this._status = StatusEntrega.FALHA;
  }

  get id(): string { return this._id; }
  get rotaId(): string | null { return this._rotaId; }
  get pedidoId(): string { return this._pedidoId; }
  get status(): StatusEntrega { return this._status; }
  get dataConfirmacao(): Date | null { return this._dataConfirmacao; }
}
