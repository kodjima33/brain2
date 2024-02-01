import type { NextApiRequest } from "next";
import { auth } from "@clerk/nextjs";
import { z } from "zod";

import { generateId, prisma } from "@brain2/db";

const getNoteSchema = z.object({
  id: z.string(),
});

/**
 * Get a note by ID
 */
export async function GET(
  _req: NextApiRequest,
  { params }: { params: { id: string } },
): Promise<Response> {
  const { userId } = auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = getNoteSchema.parse(params);
  const note = await prisma.note.findUniqueOrThrow({
    where: { id, owner: userId },
  });
  return Response.json(note);
}

/**
 * Delete a note by ID
 */
export async function DELETE(
  _req: NextApiRequest,
  { params }: { params: { id: string } },
): Promise<Response> {
  const { userId } = auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = getNoteSchema.parse(params);
  const note = await prisma.note.update({
    where: { id, owner: userId },
    data: { active: false },
  });
  return Response.json(note);
}

const updateNoteSchema = z.object({
  title: z.string(),
  content: z.string(),
});

/**
 * Update a note by ID
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
): Promise<Response> {
  const { userId } = auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = getNoteSchema.parse(params);
  const { title, content } = updateNoteSchema.parse(await req.json());

  await prisma.note.findUniqueOrThrow({
    where: { id, owner: userId },
  });

  const revision = await prisma.noteRevision.create({
    data: {
      id: generateId("noteRevision"),
      noteId: id,
      title,
      content,
    },
  });

  const updatedNote = await prisma.note.update({
    where: { id },
    data: { activeRevisionId: revision.id },
  });

  return Response.json(updatedNote);
}
