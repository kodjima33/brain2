import { Inngest } from "inngest";

import { env } from "..";

/**
 * Inngest client for task queue management
 */
export const inngestClient = new Inngest({
  id: "Brain2",
  eventKey: env.INGGEST_EVENT_KEY,
});
