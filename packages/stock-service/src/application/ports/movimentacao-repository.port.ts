import type { MovimentacaoEstoque } from "../../domain/entities/movimentacao-estoque.entity";

export interface IMovimentacaoRepository {
  save(movimentacao: MovimentacaoEstoque): Promise<void>;
  findById(id: string): Promise<MovimentacaoEstoque | null>;
  findByUnidadeId(unidadeId: string): Promise<MovimentacaoEstoque[]>;
  findAll(): Promise<MovimentacaoEstoque[]>;
}
