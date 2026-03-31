/**
 * Port para emissão de NF-e/NFC-e (RN12).
 * Interface apenas — implementação futura via adapter de integração fiscal.
 */
export interface INfEmitter {
  emitir(pedidoId: string): Promise<void>;
}
