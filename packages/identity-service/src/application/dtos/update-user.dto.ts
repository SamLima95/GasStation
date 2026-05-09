import { z } from "zod";
import { emailSchema, nameSchema } from "./auth-common.schema";

export const updateUserSchema = z.object({
  email: emailSchema.optional(),
  name: nameSchema.optional(),
  role: z.enum(["admin", "user", "manager", "operador", "gerente"]).optional(),
}).refine((dto) => dto.email !== undefined || dto.name !== undefined || dto.role !== undefined, {
  message: "at least one field is required",
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
