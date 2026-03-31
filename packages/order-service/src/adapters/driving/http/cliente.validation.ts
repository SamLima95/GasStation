import { createValidateBody } from "@lframework/shared";
import { createClienteSchema } from "../../../application/dtos/create-cliente.dto";

export const validateCreateCliente = createValidateBody(createClienteSchema);
