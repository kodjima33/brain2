import { serve } from "inngest/next";

import { functions, inngestClient } from "@brain2/lib/queue";

export const { GET, POST, PUT } = serve({
  client: inngestClient,
  functions: [functions.handlers.refineNoteTranscriptHandler],
  streaming: "allow",
});
