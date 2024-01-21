import { inngestEdgeClient } from "@brain2/lib/queue/clients";
import { handlers } from "@brain2/lib/queue/functions";
import { serve } from "inngest/next";
import { env } from "~/env";

export const runtime = "edge";

export const { GET, POST, PUT } = serve({
  client: inngestEdgeClient,
  functions: [handlers.refineNoteTranscriptHandler, handlers.dummyHandler],
  streaming: "allow",
  serveHost: (env.VERCEL_URL ?? "http://localhost:3000") + "/api/inngest/edge",
});
