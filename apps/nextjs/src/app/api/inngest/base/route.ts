import { serve } from "inngest/next";

import { inngestBaseClient } from "@brain2/lib/queue/clients";

export const runtime = "nodejs";

export const { GET, POST, PUT } = serve({
  client: inngestBaseClient,
  functions: [],
  servePath: "/api/inngest/base",
});
