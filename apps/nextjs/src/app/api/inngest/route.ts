import { serve } from "inngest/next";

import { functions, inngestClient } from "@brain2/lib";

export const { GET, POST, PUT } = serve({
  client: inngestClient,
  functions: [functions.refineNoteTranscript.handler],
});
