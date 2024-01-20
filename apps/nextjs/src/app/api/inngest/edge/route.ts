import { serve } from "inngest/next";

import {
  functions,
  inngestEdgeClient
} from "@brain2/lib/queue";

export const { GET, POST, PUT } = serve({
  client: inngestEdgeClient,
  functions: [functions.handlers.refineNoteTranscriptHandler],
  streaming: "allow",
  servePath: "/api/inngest/edge",
});
