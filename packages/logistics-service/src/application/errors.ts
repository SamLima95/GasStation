import { AppError } from "@lframework/shared";

export class EntregadorNotFoundError extends AppError {
  override name = "EntregadorNotFoundError";
  constructor(message = "Entregador not found") { super(message); Object.setPrototypeOf(this, EntregadorNotFoundError.prototype); }
}
export class InvalidEntregadorError extends AppError {
  override name = "InvalidEntregadorError";
  constructor(message = "Invalid entregador") { super(message); Object.setPrototypeOf(this, InvalidEntregadorError.prototype); }
}
export class VeiculoNotFoundError extends AppError {
  override name = "VeiculoNotFoundError";
  constructor(message = "Veiculo not found") { super(message); Object.setPrototypeOf(this, VeiculoNotFoundError.prototype); }
}
export class InvalidVeiculoError extends AppError {
  override name = "InvalidVeiculoError";
  constructor(message = "Invalid veiculo") { super(message); Object.setPrototypeOf(this, InvalidVeiculoError.prototype); }
}
export class RotaNotFoundError extends AppError {
  override name = "RotaNotFoundError";
  constructor(message = "Rota not found") { super(message); Object.setPrototypeOf(this, RotaNotFoundError.prototype); }
}
export class InvalidRotaError extends AppError {
  override name = "InvalidRotaError";
  constructor(message = "Invalid rota") { super(message); Object.setPrototypeOf(this, InvalidRotaError.prototype); }
}
export class EntregaNotFoundError extends AppError {
  override name = "EntregaNotFoundError";
  constructor(message = "Entrega not found") { super(message); Object.setPrototypeOf(this, EntregaNotFoundError.prototype); }
}
export class InvalidEntregaError extends AppError {
  override name = "InvalidEntregaError";
  constructor(message = "Invalid entrega") { super(message); Object.setPrototypeOf(this, InvalidEntregaError.prototype); }
}
export class InvalidStatusTransitionError extends AppError {
  override name = "InvalidStatusTransitionError";
  constructor(message = "Invalid status transition") { super(message); Object.setPrototypeOf(this, InvalidStatusTransitionError.prototype); }
}
