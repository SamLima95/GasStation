import { AppError } from "@lframework/shared";

export class InvalidClienteError extends AppError {
  override name = "InvalidClienteError";
  constructor(message = "Invalid cliente") {
    super(message);
    Object.setPrototypeOf(this, InvalidClienteError.prototype);
  }
}

export class ClienteNotFoundError extends AppError {
  override name = "ClienteNotFoundError";
  constructor(message = "Cliente not found") {
    super(message);
    Object.setPrototypeOf(this, ClienteNotFoundError.prototype);
  }
}

export class InvalidPedidoError extends AppError {
  override name = "InvalidPedidoError";
  constructor(message = "Invalid pedido") {
    super(message);
    Object.setPrototypeOf(this, InvalidPedidoError.prototype);
  }
}

export class PedidoNotFoundError extends AppError {
  override name = "PedidoNotFoundError";
  constructor(message = "Pedido not found") {
    super(message);
    Object.setPrototypeOf(this, PedidoNotFoundError.prototype);
  }
}

export class InvalidItemPedidoError extends AppError {
  override name = "InvalidItemPedidoError";
  constructor(message = "Invalid item pedido") {
    super(message);
    Object.setPrototypeOf(this, InvalidItemPedidoError.prototype);
  }
}

export class CreditLimitExceededError extends AppError {
  override name = "CreditLimitExceededError";
  constructor(message = "Credit limit exceeded") {
    super(message);
    Object.setPrototypeOf(this, CreditLimitExceededError.prototype);
  }
}

export class InvalidStatusTransitionError extends AppError {
  override name = "InvalidStatusTransitionError";
  constructor(message = "Invalid status transition") {
    super(message);
    Object.setPrototypeOf(this, InvalidStatusTransitionError.prototype);
  }
}
