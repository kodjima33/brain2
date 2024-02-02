import type { NextApiRequest } from "next";
import { auth } from "@clerk/nextjs";

import { prisma } from "@brain2/db";
import { inngestEdgeClient } from "@brain2/lib/queue/clients";
import { NextResponse } from "next/server";

/**
 * Rebuild a digest
 */
export async function POST(
  _req: NextApiRequest,
  { params }: { params: { id: string } },
) {
  const { userId } = auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const note = await prisma.note.findUniqueOrThrow({
    where: { id: params.id, owner: userId, active: true },
    include: { revision: true },
  });

  await inngestEdgeClient.send({
    name: "digest.rebuild",
    data: { noteId: note.id },
  });
  return new NextResponse();
}
