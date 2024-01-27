import { auth } from "@clerk/nextjs";
import { DateTime } from "luxon";
import { z } from "zod";

import { generateId, prisma } from "@brain2/db";

/**
 * Get all notes
 */
export async function GET(_req: Request): Promise<Response> {
  const { userId } = auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const notes = await prisma.note.findMany({
    where: {
      owner: userId,
      active: true,
    },
    orderBy: {
      digestStartDate: "desc",
    },
  });
  return Response.json(notes);
}

const createNoteSchema = z.object({
  title: z.string().optional(),
  content: z.string(),
});

/**
 * Create a note
 */
export async function POST(req: Request): Promise<Response> {
  const { userId } = auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const json = (await req.json()) as unknown;
  const { title, content } = createNoteSchema.parse(json);
  const formattedDate = DateTime.now().toFormat("dd/MM/yyyy HH:mm:ss");
  const fallbackTitle = `New Note ${formattedDate}`;

  const note = await prisma.note.create({
    data: {
      id: generateId("note"),
      title: title ?? fallbackTitle,
      content,
      owner: userId,
      digestSpan: "SINGLE",
    },
  });
  return Response.json(note);
}
