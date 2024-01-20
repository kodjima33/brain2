import { EventSchemas, Inngest } from "inngest";

import { env } from "..";
import { refineNoteTranscriptSchema } from "./functions/schemas";

/**
 * Inngest client for task queue management
 */
export const inngestBaseClient = new Inngest({
  id: "inngest-base",
  eventKey: env.INNGEST_EVENT_KEY,
  schemas: new EventSchemas().fromZod([]),
});

/**
 * Inngest client for task queue management
 */
export const inngestEdgeClient = new Inngest({
  id: "inngest-edge",
  eventKey: env.INNGEST_EVENT_KEY,
  schemas: new EventSchemas().fromZod([refineNoteTranscriptSchema]),
});