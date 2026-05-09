import { createValidateBody } from "@lframework/shared";
import { registerSchema } from "../../../application/dtos/register.dto";
import { loginSchema } from "../../../application/dtos/login.dto";
import { forgotPasswordSchema, resetPasswordSchema } from "../../../application/dtos/password-reset.dto";
import { refreshTokenSchema } from "../../../application/dtos/refresh-token.dto";

export const validateRegister = createValidateBody(registerSchema);
export const validateLogin = createValidateBody(loginSchema);
export const validateForgotPassword = createValidateBody(forgotPasswordSchema);
export const validateResetPassword = createValidateBody(resetPasswordSchema);
export const validateRefreshToken = createValidateBody(refreshTokenSchema);
