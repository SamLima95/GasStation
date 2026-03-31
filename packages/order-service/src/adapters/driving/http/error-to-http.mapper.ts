import { createErrorToHttpMapper } from "@lframework/shared";
import {
  InvalidClienteError,
  InvalidPedidoError,
  InvalidItemPedidoError,
  InvalidStatusTransitionError,
  CreditLimitExceededError,
  ClienteNotFoundError,
  PedidoNotFoundError,
} from "../../../application/errors";

export const mapApplicationErrorToHttp = createErrorToHttpMapper([
  [InvalidClienteError, 400],
  [InvalidPedidoError, 400],
  [InvalidItemPedidoError, 400],
  [InvalidStatusTransitionError, 400],
  [CreditLimitExceededError, 422],
  [ClienteNotFoundError, 404],
  [PedidoNotFoundError, 404],
]);
