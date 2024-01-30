import { DateTime } from "luxon";

import type { Note } from "@brain2/db/edge";
import { digestNotesStructured } from "@brain2/ai/pipelines/edge";
import { generateId, prisma } from "@brain2/db/edge";

import { inngestEdgeClient } from "../../clients";
import { argSchema, eventName } from "./schema";

interface NoteGroup {
  owner: string;
  notes: Note[];
}

/**
 * Digest batches of notes, based on the current date/time and specified note digest span
 */
export const handler = inngestEdgeClient.createFunction(
  { id: "batch-digest-handler" },
  { event: eventName },
  async ({ event }) => {
    const { span, date } = argSchema.parse(event.data);
    console.log(`Digesting notes for span ${span} and date ${date}`);

    const startDate = DateTime.fromISO(date);
    let endDate = startDate;

    // Compute end date based on span
    if (span === "DAY") {
      endDate = startDate.plus({ days: 1 });
    } else if (span === "WEEK") {
      endDate = startDate.plus({ days: 7 });
    }

    if (startDate == null || endDate == null) {
      throw new Error("Invalid date: " + date);
    }

    const notes = (await prisma.note.aggregateRaw({
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $gte: [
                    "$createdAt",
                    {
                      $dateFromString: {
                        dateString: startDate.toISO()!,
                      },
                    },
                  ],
                },
                {
                  $lte: [
                    "$createdAt",
                    {
                      $dateFromString: {
                        dateString: endDate.toISO()!,
                      },
                    },
                  ],
                },
                { $eq: ["$active", true] },
                { $eq: ["$digestSpan", "SINGLE"] },
              ],
            },
          },
        },
        {
          $sort: {
            createdAt: 1,
          },
        },
        {
          $group: {
            _id: "$owner",
            owner: {
              $first: "$owner",
            },
            notes: {
              $push: {
                id: "$_id",
                title: "$title",
                content: "$content",
                createdAt: "$createdAt",
              },
            },
          },
        },
      ],
    })) as unknown as NoteGroup[];

    for (const noteGroup of notes) {
      const { title, highlights, reflection, nextSteps } =
        await digestNotesStructured(noteGroup.notes, span);
      let content = `## Highlights\n\n${highlights}\n\n\n## Reflection\n\n${reflection}`;
      if (nextSteps) {
        content += `\n\n\n## Next steps\n\n${nextSteps}`;
      }

      const noteId = generateId("note");
      await prisma.note.create({
        data: {
          id: noteId,
          owner: noteGroup.owner,
          title,
          content,
          digestSpan: span,
          digestStartDate: startDate.toISO()!,
          parents: {
            connect: noteGroup.notes.map((note) => ({ id: note.id })),
          },
        },
      });
    }
  },
);
