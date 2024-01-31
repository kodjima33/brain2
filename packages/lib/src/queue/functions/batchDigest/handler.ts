import { DateTime } from "luxon";

import type { Note } from "@brain2/db/edge";
import { digestNotesStructured } from "@brain2/ai/pipelines/edge";
import { generateId, prisma } from "@brain2/db/edge";

import { inngestEdgeClient } from "../../clients";
import { argSchema, eventName } from "./schema";

/**
 * Digest batches of notes, based on the current date/time and specified note digest span
 */
export const handler = inngestEdgeClient.createFunction(
  { id: "batch-digest-handler" },
  { event: eventName },
  async ({ event }) => {
    const { span, date } = argSchema.parse(event.data);
    console.log(`Digesting notes for span ${span} and date ${date}`);

    const endDate = DateTime.fromISO(date);
    let startDate = endDate;

    // Compute end date based on span
    if (span === "DAY") {
      startDate = endDate.minus({ days: 1 });
    } else if (span === "WEEK") {
      startDate = endDate.minus({ days: 7 });
    }

    if (startDate == null || endDate == null) {
      throw new Error("Invalid date: " + date);
    }

    console.log("Range", startDate.toISO(), endDate.toISO()!);

    // Not using an aggregation here, because prisma accelerate has stricter limits than vercel edge runtime
    const allNotes = await prisma.note.findMany({
      where: {
        createdAt: {
          gte: startDate.toISO()!,
          lte: endDate.toISO()!,
        },
        active: true,
        digestSpan: "SINGLE",
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group notes by owner
    const noteGroups: Record<string, Note[]> = {};
    for (const note of allNotes) {
      if (!noteGroups[note.owner]) {
        noteGroups[note.owner] = [];
      }
      noteGroups[note.owner]!.push(note);
    }

    // Digest each group
    for (const [owner, notes] of Object.entries(noteGroups)) {
      const { title, highlights, reflection, nextSteps } =
        await digestNotesStructured(notes, span);
      let content = `## Highlights\n\n${highlights}\n\n\n## Reflection\n\n${reflection}`;
      if (nextSteps) {
        content += `\n\n\n## Next steps\n\n${nextSteps}`;
      }

      const noteId = generateId("note");
      await prisma.note.create({
        data: {
          id: noteId,
          owner: owner,
          title,
          content,
          digestSpan: span,
          digestStartDate: startDate.toISO()!,
          parents: {
            connect: notes.map((note) => ({ id: note.id })),
          },
        },
      });
    }

    console.log(`Created ${allNotes.length} digests`);
  },
);
