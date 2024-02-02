import { digestNotesStructured } from "@brain2/ai/pipelines/edge";
import { generateId, prisma } from "@brain2/db/edge";

import { inngestEdgeClient } from "../../clients";
import { argSchema, eventName } from "./schema";

/**
 * Rebuild a single digest, creating a new revision of the note
 */
export const handler = inngestEdgeClient.createFunction(
  { id: "rebuild-digest-handler" },
  { event: eventName },
  async ({ event }) => {
    const { noteId } = argSchema.parse(event.data);
    console.log(`Rebuilding digest for note ${noteId}`);

    const note = await prisma.note.findUniqueOrThrow({
      where: {
        id: noteId,
        active: true,
      },
      include: {
        parents: {
          include: {
            revision: true,
          },
        },
      },
    });

    const { title, highlights, reflection, nextSteps } =
      await digestNotesStructured(note.parents, note.digestSpan);
    let content = `## Highlights\n\n${highlights}\n\n\n## Reflection\n\n${reflection}`;
    if (nextSteps) {
      content += `\n\n\n## Next steps\n\n${nextSteps}`;
    }

    await prisma.note.update({
      where: {
        id: noteId,
      },
      data: {
        revision: {
          create: {
            id: generateId("noteRevision"),
            noteId,
            title,
            content,
          },
        },
      },
    });
    console.log(`Finished rebuilding digest for note ${noteId}`);
  },
);
