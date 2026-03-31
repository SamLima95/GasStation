export interface IVasilhamesListCacheInvalidator {
  invalidate(): Promise<void>;
}
