import { serve } from "inngest/next";

import { inngestBaseClient } from "@brain2/lib/queue/clients";
import { env } from "~/env";

export const runtime = "nodejs";

export const { GET, POST, PUT } = serve({
  client: inngestBaseClient,
  functions: [],
  serveHost: (env.VERCEL_URL ?? "http://localhost:3000") + "/api/inngest/base",
});
