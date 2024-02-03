import { NextResponse } from "next/server";
import { z } from "zod";

import { getSimilarNotes } from "@brain2/ai";
import { prisma } from "@brain2/db";

const schema = z.object({
  query: z.string(),
  owner: z.string(),
  span: z.enum(["SINGLE", "DAY", "WEEK"]),
  k: z.number(),
});

/**
 * Get similar notes that are potentially relevant to a given query
 */
export async function POST(req: Request) {
  const { query, owner, span, k } = schema.parse(await req.json());
  // Find similar notes for digest
  const similarNotes = await getSimilarNotes(query, owner, span, k);

  // Populate similar notes to get content
  const populatedSimilarNotes = await prisma.note.findMany({
    where: {
      id: {
        in: similarNotes.map((note) => note.metadata.id),
      },
    },
    include: {
      revision: true,
    },
  });

  return NextResponse.json(populatedSimilarNotes);
}
