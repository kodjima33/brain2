import type { LiteralZodEventSchema } from "inngest";
import { z } from "zod";

export const eventName = "dummy.event";

export const argSchema = z.object({
  argument: z.string(),
});

export const eventSchema = z.object({
  name: z.literal(eventName),
  data: argSchema,
}) satisfies LiteralZodEventSchema;
