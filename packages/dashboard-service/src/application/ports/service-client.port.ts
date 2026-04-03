/**
 * Port para consulta HTTP aos outros microsserviços.
 * Cada método retorna dados crus (arrays) que serão agregados pelos use cases.
 */
export interface IServiceClient {
  /** Busca pedidos do order-service */
  fetchPedidos(unidadeId?: string): Promise<Array<{ status: string; valorTotal: number }>>;

  /** Busca movimentações do stock-service */
  fetchMovimentacoes(unidadeId?: string): Promise<Array<{ tipoMovimentacao: string; quantidade: number }>>;

  /** Busca caixas do financial-service */
  fetchCaixas(unidadeId?: string): Promise<Array<{ status: string }>>;

  /** Busca contas a receber do financial-service */
  fetchContasAReceber(unidadeId?: string): Promise<Array<{ status: string; valorAberto: number }>>;

  /** Busca rotas do logistics-service */
  fetchRotas(unidadeId?: string): Promise<Array<{ status: string }>>;

  /** Busca entregas do logistics-service */
  fetchEntregas(unidadeId?: string): Promise<Array<{ status: string }>>;
}
