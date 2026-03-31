import { StatusRota } from "../types";

export class Rota {
  private constructor(
    private readonly _id: string, private readonly _unidadeId: string,
    private readonly _entregadorId: string, private readonly _veiculoId: string,
    private readonly _dataRota: Date, private _status: StatusRota
  ) {}

  static create(id: string, unidadeId: string, entregadorId: string, veiculoId: string, dataRota: Date): Rota {
    if (!unidadeId || unidadeId.trim().length === 0) throw new Error("UnidadeId is required");
    if (!entregadorId || entregadorId.trim().length === 0) throw new Error("EntregadorId is required");
    if (!veiculoId || veiculoId.trim().length === 0) throw new Error("VeiculoId is required");
    return new Rota(id, unidadeId.trim(), entregadorId.trim(), veiculoId.trim(), dataRota, StatusRota.PLANEJADA);
  }

  static reconstitute(id: string, unidadeId: string, entregadorId: string, veiculoId: string, dataRota: Date, status: StatusRota): Rota {
    return new Rota(id, unidadeId, entregadorId, veiculoId, dataRota, status);
  }

  iniciar(): void {
    if (this._status !== StatusRota.PLANEJADA) throw new Error(`Cannot start rota with status ${this._status}`);
    this._status = StatusRota.EM_ANDAMENTO;
  }

  finalizar(): void {
    if (this._status !== StatusRota.EM_ANDAMENTO) throw new Error(`Cannot finalize rota with status ${this._status}`);
    this._status = StatusRota.FINALIZADA;
  }

  cancelar(): void {
    if (this._status !== StatusRota.PLANEJADA && this._status !== StatusRota.EM_ANDAMENTO)
      throw new Error(`Cannot cancel rota with status ${this._status}`);
    this._status = StatusRota.CANCELADA;
  }

  get id(): string { return this._id; }
  get unidadeId(): string { return this._unidadeId; }
  get entregadorId(): string { return this._entregadorId; }
  get veiculoId(): string { return this._veiculoId; }
  get dataRota(): Date { return this._dataRota; }
  get status(): StatusRota { return this._status; }
}
