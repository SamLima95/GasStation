export interface Entregador {
  id: string;
  nome: string;
  telefone: string;
  unidadeId: string;
  status: string;
}

export interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  status: string;
  unidadeId: string;
}

export interface Rota {
  id: string;
  entregadorId: string;
  unidadeId: string;
  status: 'PLANEJADA' | 'EM_ANDAMENTO' | 'FINALIZADA';
  data: string;
}

export interface Entrega {
  id: string;
  rotaId: string;
  pedidoId: string;
  status: 'PENDENTE' | 'EM_ROTA' | 'ENTREGUE';
  createdAt: string;
}
