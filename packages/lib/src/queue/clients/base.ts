import { EventSchemas, Inngest } from "inngest";

import { env } from "../..";

/**
 * Inngest client for task queue management
 */
export const inngestBaseClient = new Inngest({
  id: "inngest-base",
  eventKey: env.INNGEST_EVENT_KEY,
  schemas: new EventSchemas().fromZod([]),
});
