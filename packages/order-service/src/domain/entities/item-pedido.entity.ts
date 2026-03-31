/**
 * Entidade de domínio: ItemPedido (item de um pedido).
 */
export class ItemPedido {
  private constructor(
    private readonly _id: string,
    private readonly _pedidoId: string,
    private readonly _vasilhameId: string,
    private readonly _quantidade: number,
    private readonly _precoUnitario: number
  ) {}

  static create(
    id: string,
    pedidoId: string,
    vasilhameId: string,
    quantidade: number,
    precoUnitario: number
  ): ItemPedido {
    if (!vasilhameId || vasilhameId.trim().length === 0) {
      throw new Error("VasilhameId is required");
    }
    if (quantidade <= 0) {
      throw new Error("Quantidade must be positive");
    }
    if (precoUnitario <= 0) {
      throw new Error("PrecoUnitario must be positive");
    }
    return new ItemPedido(id, pedidoId, vasilhameId.trim(), quantidade, precoUnitario);
  }

  static reconstitute(
    id: string,
    pedidoId: string,
    vasilhameId: string,
    quantidade: number,
    precoUnitario: number
  ): ItemPedido {
    return new ItemPedido(id, pedidoId, vasilhameId, quantidade, precoUnitario);
  }

  get subtotal(): number { return this._quantidade * this._precoUnitario; }

  get id(): string { return this._id; }
  get pedidoId(): string { return this._pedidoId; }
  get vasilhameId(): string { return this._vasilhameId; }
  get quantidade(): number { return this._quantidade; }
  get precoUnitario(): number { return this._precoUnitario; }
}
