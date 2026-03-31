import { TipoMovimentacao } from "../types";

/**
 * Entidade de domínio: MovimentacaoEstoque (movimentação de estoque de vasilhames).
 */
export class MovimentacaoEstoque {
  private constructor(
    private readonly _id: string,
    private readonly _unidadeId: string,
    private readonly _vasilhameId: string,
    private readonly _usuarioId: string,
    private readonly _pedidoId: string | null,
    private readonly _tipoMovimentacao: TipoMovimentacao,
    private readonly _quantidade: number,
    private readonly _dataHora: Date
  ) {}

  static create(
    id: string,
    unidadeId: string,
    vasilhameId: string,
    usuarioId: string,
    pedidoId: string | null,
    tipoMovimentacao: TipoMovimentacao,
    quantidade: number
  ): MovimentacaoEstoque {
    if (quantidade <= 0) {
      throw new Error("Quantidade must be positive");
    }
    if (!unidadeId || unidadeId.trim().length === 0) {
      throw new Error("UnidadeId is required");
    }
    if (!vasilhameId || vasilhameId.trim().length === 0) {
      throw new Error("VasilhameId is required");
    }
    if (!usuarioId || usuarioId.trim().length === 0) {
      throw new Error("UsuarioId is required");
    }
    return new MovimentacaoEstoque(
      id, unidadeId.trim(), vasilhameId.trim(), usuarioId.trim(),
      pedidoId?.trim() || null, tipoMovimentacao, quantidade, new Date()
    );
  }

  static reconstitute(
    id: string,
    unidadeId: string,
    vasilhameId: string,
    usuarioId: string,
    pedidoId: string | null,
    tipoMovimentacao: TipoMovimentacao,
    quantidade: number,
    dataHora: Date
  ): MovimentacaoEstoque {
    return new MovimentacaoEstoque(
      id, unidadeId, vasilhameId, usuarioId, pedidoId,
      tipoMovimentacao, quantidade, dataHora
    );
  }

  get id(): string { return this._id; }
  get unidadeId(): string { return this._unidadeId; }
  get vasilhameId(): string { return this._vasilhameId; }
  get usuarioId(): string { return this._usuarioId; }
  get pedidoId(): string | null { return this._pedidoId; }
  get tipoMovimentacao(): TipoMovimentacao { return this._tipoMovimentacao; }
  get quantidade(): number { return this._quantidade; }
  get dataHora(): Date { return this._dataHora; }
}
