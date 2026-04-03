/**
 * Port para emissão de NF-e/NFC-e (RN12, RN33).
 */
export interface NfEmissionResult {
  chaveAcesso: string;
  status: "AUTORIZADA" | "REJEITADA" | "FALHA";
  mensagem: string;
}

export interface INfEmitter {
  emitir(pedidoId: string, valorTotal: number, unidadeId: string): Promise<NfEmissionResult>;
}
