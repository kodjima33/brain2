import type { NextApiRequest } from "next";
import { z } from "zod";

import { prisma } from "@brain2/db";

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
  const { id } = getNoteSchema.parse(params);
  const note = await prisma.note.findUnique({ where: { id } });
  return Response.json(note);
}

/**
 * Delete a note by ID
 */
export async function DELETE(
  _req: NextApiRequest,
  { params }: { params: { id: string } },
): Promise<Response> {
  const { id } = getNoteSchema.parse(params);
  const note = await prisma.note.update({
    where: { id },
    data: { active: false },
  });
  return Response.json(note);
}
