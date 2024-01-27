import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs";
import { DateTime } from "luxon";
import { z } from "zod";

import { digestNotesStructured } from "@brain2/ai/pipelines/digestNotesStructured";
import { generateId, NoteDigestSpan, prisma } from "@brain2/db/edge";

const digestNoteSchema = z.object({
  span: z.enum([NoteDigestSpan.DAY, NoteDigestSpan.WEEK]),
  startDate: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { span, startDate: startDateRaw } = digestNoteSchema.parse(
    await req.json(),
  );

  const startDate = startDateRaw
    ? DateTime.fromISO(startDateRaw)
    : DateTime.now();
  let endDate = startDate;

  // Compute end date based on span
  if (span === NoteDigestSpan.DAY) {
    endDate = startDate.plus({ days: 1 });
  } else if (span === NoteDigestSpan.WEEK) {
    endDate = startDate.plus({ days: 7 });
  }

  const notes = await prisma.note.findMany({
    where: {
      owner: userId,
      createdAt: {
        gte: startDate.toISO()!,
        lte: endDate.toISO()!,
      },
      active: true,
    },
  });

  if (notes.length === 0) {
    return new Response("No notes found", { status: 404 });
  }

  const { title, highlights, reflection, nextSteps } =
    await digestNotesStructured(notes, span);
  let content = `## Highlights\n\n${highlights}\n\n\n## Reflection\n\n${reflection}`;
  if (nextSteps) {
    content += `\n\n\n## Next steps\n\n${nextSteps}`;
  }

  const noteId = generateId("note");
  const note = await prisma.note.create({
    data: {
      id: noteId,
      owner: userId,
      title,
      content,
      digestSpan: span,
      digestStartDate: startDate.toISO()!,
      parents: {
        connect: notes.map((note) => ({ id: note.id })),
      },
    },
  });
  return Response.json(note);
}
