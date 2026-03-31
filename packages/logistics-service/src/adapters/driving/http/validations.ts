import { createValidateBody } from "@lframework/shared";
import { createEntregadorSchema } from "../../../application/dtos/create-entregador.dto";
import { createVeiculoSchema } from "../../../application/dtos/create-veiculo.dto";
import { createRotaSchema } from "../../../application/dtos/create-rota.dto";

export const validateCreateEntregador = createValidateBody(createEntregadorSchema);
export const validateCreateVeiculo = createValidateBody(createVeiculoSchema);
export const validateCreateRota = createValidateBody(createRotaSchema);
