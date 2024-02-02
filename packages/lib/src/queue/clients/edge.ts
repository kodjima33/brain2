import { EventSchemas, Inngest } from "inngest";

import { env } from "../..";
import {
  batchDigestSchema,
  dummySchema,
  rebuildDigestSchema,
  refineNoteTranscriptSchema,
} from "../functions/schemas";

/**
 * Inngest client for task queue management
 */
export const inngestEdgeClient = new Inngest({
  id: "inngest-edge",
  eventKey: env.INNGEST_EVENT_KEY,
  schemas: new EventSchemas().fromZod([
    refineNoteTranscriptSchema,
    dummySchema,
    batchDigestSchema,
    rebuildDigestSchema,
  ]),
});
