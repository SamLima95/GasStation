import { createErrorToHttpMapper } from "@lframework/shared";
import { InvalidEntregadorError, InvalidVeiculoError, InvalidRotaError, InvalidEntregaError, InvalidStatusTransitionError, EntregadorNotFoundError, VeiculoNotFoundError, RotaNotFoundError, EntregaNotFoundError } from "../../../application/errors";

export const mapApplicationErrorToHttp = createErrorToHttpMapper([
  [InvalidEntregadorError, 400], [InvalidVeiculoError, 400], [InvalidRotaError, 400],
  [InvalidEntregaError, 400], [InvalidStatusTransitionError, 400],
  [EntregadorNotFoundError, 404], [VeiculoNotFoundError, 404], [RotaNotFoundError, 404], [EntregaNotFoundError, 404],
]);
