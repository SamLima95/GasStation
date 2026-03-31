import { AppError } from "@lframework/shared";

export class CaixaNotFoundError extends AppError {
  override name = "CaixaNotFoundError";
  constructor(message = "Caixa not found") { super(message); Object.setPrototypeOf(this, CaixaNotFoundError.prototype); }
}
export class CaixaAlreadyOpenError extends AppError {
  override name = "CaixaAlreadyOpenError";
  constructor(message = "Caixa already open for this unidade") { super(message); Object.setPrototypeOf(this, CaixaAlreadyOpenError.prototype); }
}
export class InvalidCaixaError extends AppError {
  override name = "InvalidCaixaError";
  constructor(message = "Invalid caixa") { super(message); Object.setPrototypeOf(this, InvalidCaixaError.prototype); }
}
export class ContaAReceberNotFoundError extends AppError {
  override name = "ContaAReceberNotFoundError";
  constructor(message = "Conta a receber not found") { super(message); Object.setPrototypeOf(this, ContaAReceberNotFoundError.prototype); }
}
export class InvalidContaAReceberError extends AppError {
  override name = "InvalidContaAReceberError";
  constructor(message = "Invalid conta a receber") { super(message); Object.setPrototypeOf(this, InvalidContaAReceberError.prototype); }
}
export class InvalidPaymentError extends AppError {
  override name = "InvalidPaymentError";
  constructor(message = "Invalid payment") { super(message); Object.setPrototypeOf(this, InvalidPaymentError.prototype); }
}
export class InvalidStatusTransitionError extends AppError {
  override name = "InvalidStatusTransitionError";
  constructor(message = "Invalid status transition") { super(message); Object.setPrototypeOf(this, InvalidStatusTransitionError.prototype); }
}
