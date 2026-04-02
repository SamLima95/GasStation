import { createErrorToHttpMapper } from "@lframework/shared";
import {
  UserAlreadyExistsError,
  InvalidCredentialsError,
  InvalidEmailError,
  PasswordValidationError,
  UnidadeNotFoundError,
  UserAlreadyLinkedError,
  UserNotFoundError,
} from "../../../application/errors";

/**
 * Mapeia erros de aplicação/domínio para resposta HTTP (status + mensagem).
 * Centraliza as regras em um único lugar (SRP); controllers só orquestram.
 */
export const mapApplicationErrorToHttp = createErrorToHttpMapper([
  [UserAlreadyExistsError, 409],
  [InvalidCredentialsError, 401],
  [InvalidEmailError, 400],
  [PasswordValidationError, 400],
  [UnidadeNotFoundError, 404],
  [UserAlreadyLinkedError, 409],
  [UserNotFoundError, 404],
]);
