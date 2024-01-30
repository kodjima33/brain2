import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { inngestEdgeClient } from "@brain2/lib/queue/clients";
import { z } from "zod";

const schema = z.object({
  date: z.string()
})

export async function POST(req: NextRequest) {
  const { date } = schema.parse(await req.json());

  await inngestEdgeClient.send({
    name: "digest.batch",
    data: {
      span: "DAY",
      date,
    },
  });

  return new NextResponse("OK");
}
