import { createValidateBody } from "@lframework/shared";
import { createPedidoSchema } from "../../../application/dtos/create-pedido.dto";

export const validateCreatePedido = createValidateBody(createPedidoSchema);
