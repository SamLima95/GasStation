import { createValidateBody } from "@lframework/shared";
import { createComodatoSchema } from "../../../application/dtos/create-comodato.dto";

export const validateCreateComodato = createValidateBody(createComodatoSchema);
