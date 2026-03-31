import { z } from "zod";

export const createVasilhameSchema = z.object({
  tipo: z.string().min(1, "tipo is required").max(100, "tipo too long").trim(),
  descricao: z.string().min(1, "descricao is required").max(500, "descricao too long").trim(),
  capacidade: z.coerce
    .number()
    .finite("capacidade must be a finite number")
    .positive("capacidade must be positive"),
});

export type CreateVasilhameDto = z.infer<typeof createVasilhameSchema>;
