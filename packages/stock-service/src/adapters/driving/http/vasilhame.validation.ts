import { createValidateBody } from "@lframework/shared";
import { createVasilhameSchema } from "../../../application/dtos/create-vasilhame.dto";

export const validateCreateVasilhame = createValidateBody(createVasilhameSchema);
