import { randomUUID } from "crypto";
import { logger } from "@lframework/shared";
import type { INfEmitter, NfEmissionResult } from "../../../application/ports/nf-emitter.port";

/**
 * Adapter stub para emissão de NF-e/NFC-e.
 * Simula integração fiscal com delay e retorno de sucesso.
 * Substituir por adapter real (SEFAZ) em produção.
 */
export class StubNfEmitterAdapter implements INfEmitter {
  async emitir(pedidoId: string, valorTotal: number, unidadeId: string): Promise<NfEmissionResult> {
    logger.info({ pedidoId, valorTotal, unidadeId }, "Emitindo NF-e (stub)");

    // Simula latência de comunicação com SEFAZ
    await new Promise((r) => setTimeout(r, 200));

    const chaveAcesso = `NFe${Date.now()}${randomUUID().slice(0, 8)}`;

    logger.info({ pedidoId, chaveAcesso }, "NF-e autorizada (stub)");

    return {
      chaveAcesso,
      status: "AUTORIZADA",
      mensagem: "NF-e autorizada com sucesso (ambiente de simulação)",
    };
  }
}
