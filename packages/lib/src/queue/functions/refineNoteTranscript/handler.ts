import { refineTranscript } from "@brain2/ai";
import { prisma } from "@brain2/db";

import { inngestEdgeClient } from "../../client";
import { argSchema, eventName } from "./schema";

/**
 * Refine a raw recording note transcript, improving formatting and grammar
 */
export const handler = inngestEdgeClient.createFunction(
  { id: "refine-note-transcript" },
  { event: eventName },
  async ({ event }) => {
    const { noteId } = argSchema.parse(event.data);
    const note = await prisma.note.findUniqueOrThrow({
      where: {
        id: noteId,
      },
    });
    const transcript = note.content;

    const refinedTranscript = await refineTranscript(transcript);

    // Update note with refined transcript and mark as active
    await prisma.note.update({
      where: {
        id: noteId,
      },
      data: {
        content: refinedTranscript,
        active: true,
      },
    });
  },
);
