import { createErrorToHttpMapper } from "@lframework/shared";
import { InvalidCaixaError, InvalidContaAReceberError, InvalidPaymentError, InvalidStatusTransitionError, CaixaAlreadyOpenError, CaixaNotFoundError, ContaAReceberNotFoundError } from "../../../application/errors";

export const mapApplicationErrorToHttp = createErrorToHttpMapper([
  [InvalidCaixaError, 400],
  [InvalidContaAReceberError, 400],
  [InvalidPaymentError, 400],
  [InvalidStatusTransitionError, 400],
  [CaixaAlreadyOpenError, 409],
  [CaixaNotFoundError, 404],
  [ContaAReceberNotFoundError, 404],
]);
