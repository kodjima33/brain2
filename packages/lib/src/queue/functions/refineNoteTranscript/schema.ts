import { LiteralZodEventSchema } from "inngest";
import { z } from "zod";

export const eventName = "recording.created";

export const argSchema = z.object({
  noteId: z.string(),
});

export const eventSchema = z.object({
  name: z.literal(eventName),
  data: argSchema,
}) satisfies LiteralZodEventSchema;