import type { LiteralZodEventSchema } from "inngest";
import { z } from "zod";

import type { NoteDigestSpan } from "@brain2/db/edge";

export const eventName = "digest.batch";

export const argSchema = z.object({
  span: z.enum<string, [NoteDigestSpan, ...NoteDigestSpan[]]>([
    "SINGLE",
    "DAY",
    "WEEK",
  ]),
  date: z.string(),
});

export const eventSchema = z.object({
  name: z.literal(eventName),
  data: argSchema,
}) satisfies LiteralZodEventSchema;
