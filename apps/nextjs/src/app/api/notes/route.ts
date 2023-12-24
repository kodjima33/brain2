
import { prisma } from "@brain2/db";

/**
 * Get all notes
 */
export async function GET(_req: Request): Promise<Response> {
  const notes = await prisma.note.findMany();
  return Response.json({
    notes,
  });
}
