import { z } from "zod";

export const linkUserToUnidadeSchema = z.object({
  userId: z.string().uuid("userId inválido"),
  unidadeId: z.string().uuid("unidadeId inválido"),
  nivel: z.enum(["operador", "gerente", "admin_holding"]).default("operador"),
});

export type LinkUserToUnidadeDto = z.infer<typeof linkUserToUnidadeSchema>;

export const usuarioUnidadeResponseDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  unidadeId: z.string(),
  nivel: z.string(),
  createdAt: z.string(),
});

export type UsuarioUnidadeResponseDto = z.infer<typeof usuarioUnidadeResponseDtoSchema>;
