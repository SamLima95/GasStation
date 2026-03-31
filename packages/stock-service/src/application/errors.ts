/**
 * Application/domain errors for stock service.
 * Extend AppError from shared so instanceof and serialization work consistently.
 */

import { AppError } from "@lframework/shared";

export class InvalidVasilhameError extends AppError {
  override name = "InvalidVasilhameError";
  constructor(message = "Invalid vasilhame") {
    super(message);
    Object.setPrototypeOf(this, InvalidVasilhameError.prototype);
  }
}

export class InvalidMovimentacaoError extends AppError {
  override name = "InvalidMovimentacaoError";
  constructor(message = "Invalid movimentacao") {
    super(message);
    Object.setPrototypeOf(this, InvalidMovimentacaoError.prototype);
  }
}

export class InvalidComodatoError extends AppError {
  override name = "InvalidComodatoError";
  constructor(message = "Invalid comodato") {
    super(message);
    Object.setPrototypeOf(this, InvalidComodatoError.prototype);
  }
}

export class VasilhameNotFoundError extends AppError {
  override name = "VasilhameNotFoundError";
  constructor(message = "Vasilhame not found") {
    super(message);
    Object.setPrototypeOf(this, VasilhameNotFoundError.prototype);
  }
}

export class ComodatoNotFoundError extends AppError {
  override name = "ComodatoNotFoundError";
  constructor(message = "Comodato not found") {
    super(message);
    Object.setPrototypeOf(this, ComodatoNotFoundError.prototype);
  }
}
