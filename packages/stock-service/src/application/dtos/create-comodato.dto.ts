import { z } from "zod";

export const createComodatoSchema = z.object({
  clienteId: z.string().min(1, "clienteId is required").max(64),
  unidadeId: z.string().min(1, "unidadeId is required").max(64),
  vasilhameId: z.string().min(1, "vasilhameId is required").max(64),
  saldoComodato: z.coerce
    .number()
    .int("saldoComodato must be an integer")
    .nonnegative("saldoComodato must be non-negative"),
});

export type CreateComodatoDto = z.infer<typeof createComodatoSchema>;
