import type { z } from "zod";
import { Inngest } from "inngest";

import type { refineNoteTranscript } from "./functions";
import { env } from "..";

/**
 * Event types
 * Augment this type with new events as needed
 */
export type QueueEvent = "recording.created";

type QueueEventArgs<E extends QueueEvent> = E extends "recording.created"
  ? z.infer<typeof refineNoteTranscript.schema>
  : never;

/**
 * Inngest client for task queue management
 */
export const inngestClient = new Inngest({
  id: "Brain2",
  eventKey: env.INNGEST_EVENT_KEY,
});

/**
 * Trigger an event for asynchronous processing
 */
export async function triggerEvent<E extends QueueEvent>(
  event: E,
  data: QueueEventArgs<E>,
) {
  return inngestClient.send({
    name: event,
    data,
  });
}
