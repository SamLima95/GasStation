export interface Vasilhame {
  id: string;
  tipo: string;
  capacidade: number;
  descricao: string;
  unidadeId: string;
}

export interface MovimentacaoEstoque {
  id: string;
  vasilhameId: string;
  tipoMovimentacao: 'ENTRADA' | 'SAIDA' | 'RETORNO' | 'AVARIA';
  quantidade: number;
  unidadeId: string;
  createdAt: string;
}
