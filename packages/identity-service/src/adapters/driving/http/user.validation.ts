import { createValidateBody } from "@lframework/shared";
import { createUserSchema } from "../../../application/dtos/create-user.dto";
import { updateUserSchema } from "../../../application/dtos/update-user.dto";

export const validateCreateUser = createValidateBody(createUserSchema);
export const validateUpdateUser = createValidateBody(updateUserSchema);
