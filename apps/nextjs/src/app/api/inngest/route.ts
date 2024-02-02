import { serve } from "inngest/next";

import { inngestEdgeClient } from "@brain2/lib/queue/clients";
import { handlers } from "@brain2/lib/queue/functions";

export const runtime = "edge";

export const { GET, POST, PUT } = serve({
  client: inngestEdgeClient,
  functions: [
    handlers.refineNoteTranscriptHandler,
    handlers.dummyHandler,
    handlers.batchDigestHandler,
    handlers.rebuildDigestHandler,
  ],
  streaming: "allow",
});
