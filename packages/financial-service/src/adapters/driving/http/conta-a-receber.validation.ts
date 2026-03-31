import { createValidateBody } from "@lframework/shared";
import { createContaAReceberSchema } from "../../../application/dtos/create-conta-a-receber.dto";
import { receivePaymentSchema } from "../../../application/dtos/receive-payment.dto";

export const validateCreateContaAReceber = createValidateBody(createContaAReceberSchema);
export const validateReceivePayment = createValidateBody(receivePaymentSchema);
