import { z } from "zod";

export const receivePaymentSchema = z.object({
  valor: z.coerce.number().finite().positive("valor must be positive"),
  caixaId: z.string().min(1, "caixaId is required").max(64),
});

export type ReceivePaymentDto = z.infer<typeof receivePaymentSchema>;
