import { StatusPedido, TipoPagamento } from "../types";
import { ItemPedido } from "./item-pedido.entity";

/**
 * Entidade de domínio: Pedido (pedido de venda).
 */
export class Pedido {
  private constructor(
    private readonly _id: string,
    private readonly _clienteId: string,
    private readonly _unidadeId: string,
    private _status: StatusPedido,
    private readonly _tipoPagamento: TipoPagamento,
    private _valorTotal: number,
    private readonly _dataPedido: Date,
    private readonly _dataEntregaPrevista: Date | null,
    private readonly _itens: ItemPedido[]
  ) {}

  static create(
    id: string,
    clienteId: string,
    unidadeId: string,
    tipoPagamento: TipoPagamento,
    itens: ItemPedido[],
    dataEntregaPrevista: Date | null = null
  ): Pedido {
    if (!clienteId || clienteId.trim().length === 0) {
      throw new Error("ClienteId is required");
    }
    if (!unidadeId || unidadeId.trim().length === 0) {
      throw new Error("UnidadeId is required");
    }
    if (itens.length === 0) {
      throw new Error("Pedido must have at least one item");
    }
    const valorTotal = itens.reduce((sum, item) => sum + item.subtotal, 0);
    return new Pedido(
      id, clienteId.trim(), unidadeId.trim(), StatusPedido.PENDENTE,
      tipoPagamento, valorTotal, new Date(), dataEntregaPrevista, itens
    );
  }

  static reconstitute(
    id: string,
    clienteId: string,
    unidadeId: string,
    status: StatusPedido,
    tipoPagamento: TipoPagamento,
    valorTotal: number,
    dataPedido: Date,
    dataEntregaPrevista: Date | null,
    itens: ItemPedido[]
  ): Pedido {
    return new Pedido(id, clienteId, unidadeId, status, tipoPagamento, valorTotal, dataPedido, dataEntregaPrevista, itens);
  }

  confirmar(): void {
    if (this._status !== StatusPedido.PENDENTE) {
      throw new Error(`Cannot confirm pedido with status ${this._status}`);
    }
    this._status = StatusPedido.CONFIRMADO;
  }

  entregar(): void {
    if (this._status !== StatusPedido.CONFIRMADO) {
      throw new Error(`Cannot deliver pedido with status ${this._status}`);
    }
    this._status = StatusPedido.ENTREGUE;
  }

  cancelar(): void {
    if (this._status !== StatusPedido.PENDENTE && this._status !== StatusPedido.CONFIRMADO) {
      throw new Error(`Cannot cancel pedido with status ${this._status}`);
    }
    this._status = StatusPedido.CANCELADO;
  }

  get id(): string { return this._id; }
  get clienteId(): string { return this._clienteId; }
  get unidadeId(): string { return this._unidadeId; }
  get status(): StatusPedido { return this._status; }
  get tipoPagamento(): TipoPagamento { return this._tipoPagamento; }
  get valorTotal(): number { return this._valorTotal; }
  get dataPedido(): Date { return this._dataPedido; }
  get dataEntregaPrevista(): Date | null { return this._dataEntregaPrevista; }
  get itens(): ItemPedido[] { return [...this._itens]; }
}
