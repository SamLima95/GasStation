import { createValidateBody } from "@lframework/shared";
import { createMovimentacaoSchema } from "../../../application/dtos/create-movimentacao.dto";

export const validateCreateMovimentacao = createValidateBody(createMovimentacaoSchema);
