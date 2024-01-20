import { EventSchemas, Inngest } from "inngest";

import { env } from "..";
import { refineNoteTranscriptSchema } from "./functions/schemas";

/**
 * Inngest client for task queue management
 */
export const inngestClient = new Inngest({
  id: "Brain2",
  eventKey: env.INNGEST_EVENT_KEY,
  schemas: new EventSchemas().fromZod([refineNoteTranscriptSchema]),
});

type InngestSendArgs = Parameters<(typeof inngestClient)["send"]>[0];

/**
 * Send an event to the task queue
 */
export async function sendEvent(args: InngestSendArgs) {
  await inngestClient.send(args);
}
