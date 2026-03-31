import { createValidateBody } from "@lframework/shared";
import { openCaixaSchema } from "../../../application/dtos/open-caixa.dto";

export const validateOpenCaixa = createValidateBody(openCaixaSchema);
