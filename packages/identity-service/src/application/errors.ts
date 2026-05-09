/**
 * Application/domain errors for identity service.
 * Extend AppError from shared so instanceof and serialization work consistently.
 */

import { AppError } from "@lframework/shared";

export class UserAlreadyExistsError extends AppError {
  override name = "UserAlreadyExistsError";
  constructor(message = "User with this email already exists") {
    super(message);
    Object.setPrototypeOf(this, UserAlreadyExistsError.prototype);
  }
}

export class InvalidCredentialsError extends AppError {
  override name = "InvalidCredentialsError";
  constructor(message = "Invalid email or password") {
    super(message);
    Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
  }
}

export class InvalidEmailError extends AppError {
  override name = "InvalidEmailError";
  constructor(message = "Invalid email") {
    super(message);
    Object.setPrototypeOf(this, InvalidEmailError.prototype);
  }
}

export class PasswordValidationError extends AppError {
  override name = "PasswordValidationError";
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, PasswordValidationError.prototype);
  }
}

export class UnidadeNotFoundError extends AppError {
  override name = "UnidadeNotFoundError";
  constructor(message = "Unidade não encontrada") {
    super(message);
    Object.setPrototypeOf(this, UnidadeNotFoundError.prototype);
  }
}

export class UserAlreadyLinkedError extends AppError {
  override name = "UserAlreadyLinkedError";
  constructor(message = "Usuário já vinculado a esta unidade") {
    super(message);
    Object.setPrototypeOf(this, UserAlreadyLinkedError.prototype);
  }
}

export class UserNotFoundError extends AppError {
  override name = "UserNotFoundError";
  constructor(message = "Usuário não encontrado") {
    super(message);
    Object.setPrototypeOf(this, UserNotFoundError.prototype);
  }
}

export class SessionNotFoundError extends AppError {
  override name = "SessionNotFoundError";
  constructor(message = "Session not found") {
    super(message);
    Object.setPrototypeOf(this, SessionNotFoundError.prototype);
  }
}
