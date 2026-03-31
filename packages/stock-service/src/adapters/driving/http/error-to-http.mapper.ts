import { createErrorToHttpMapper } from "@lframework/shared";
import {
  InvalidVasilhameError,
  InvalidMovimentacaoError,
  InvalidComodatoError,
  VasilhameNotFoundError,
  ComodatoNotFoundError,
} from "../../../application/errors";

/**
 * Mapeia erros de aplicação/domínio para resposta HTTP (status + mensagem).
 * Centraliza as regras em um único lugar (SRP); controllers só orquestram.
 */
export const mapApplicationErrorToHttp = createErrorToHttpMapper([
  [InvalidVasilhameError, 400],
  [InvalidMovimentacaoError, 400],
  [InvalidComodatoError, 400],
  [VasilhameNotFoundError, 404],
  [ComodatoNotFoundError, 404],
]);
