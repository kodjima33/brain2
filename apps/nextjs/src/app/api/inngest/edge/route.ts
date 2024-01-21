import { inngestEdgeClient } from "@brain2/lib/queue/clients";
import { serve } from "inngest/next";

export const runtime = "edge";

export const { GET, POST, PUT } = serve({
  client: inngestEdgeClient,
  functions: [],
  streaming: "allow",
  servePath: "/api/inngest/edge",
});
