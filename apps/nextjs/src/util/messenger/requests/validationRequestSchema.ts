import { z } from "zod";

export const validationRequestSchema = z.object({
  mode: z.string(),
  verify_token: z.string(),
  challenge: z.string(),
});
