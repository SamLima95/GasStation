import type { IVasilhamesListCacheInvalidator } from "../../../application/ports/vasilhames-list-cache-invalidator.port";
import type { ICacheService } from "@lframework/shared";

const VASILHAMES_LIST_KEY = "vasilhames:list";

/**
 * Adapter: invalida o cache da lista de vasilhames após criação/atualização.
 * Implementa a porta IVasilhamesListCacheInvalidator (DIP).
 */
export class VasilhamesListCacheInvalidatorAdapter implements IVasilhamesListCacheInvalidator {
  constructor(private readonly cache: ICacheService) {}

  async invalidate(): Promise<void> {
    await this.cache.delete(VASILHAMES_LIST_KEY);
  }
}
