import type { NotaFiscal } from "../../domain/entities/nota-fiscal.entity";

export interface INotaFiscalRepository {
  save(nf: NotaFiscal): Promise<void>;
  findByPedidoId(pedidoId: string): Promise<NotaFiscal | null>;
  update(nf: NotaFiscal): Promise<void>;
}
