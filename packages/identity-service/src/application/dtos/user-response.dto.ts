import { z } from "zod";

export const userResponseDtoSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.string().optional(),
  status: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type UserResponseDto = z.infer<typeof userResponseDtoSchema>;
