import { z } from "zod";

import { generateId, prisma } from "@brain2/db";

/**
 * Get all notes
 */
export async function GET(_req: Request): Promise<Response> {
  const notes = await prisma.note.findMany();
  return Response.json(notes);
}

const createNoteSchema = z.object({
  content: z.string(),
});

/**
 * Create a note
 */
export async function POST(req: Request): Promise<Response> {
  const json = await req.json() as unknown;
  const { content } = createNoteSchema.parse(json);
  const note = await prisma.note.create({
    data: {
      id: generateId("note"),
      content,
      owner: "",
      digestSpan: "SINGLE"
    },
  });
  return Response.json(note);
}
