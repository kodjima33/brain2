import { inngestEdgeClient } from "@brain2/lib/queue/clients";
import { handlers } from "@brain2/lib/queue/functions";
import { serve } from "inngest/next";

export const runtime = "edge";

export const { GET, POST, PUT } = serve({
  client: inngestEdgeClient,
  functions: [handlers.refineNoteTranscriptHandler],
  streaming: "allow",
  servePath: "/api/inngest/edge",
});
