import { NextRequest, NextResponse } from "next/server";

import { inngestEdgeClient } from "@brain2/lib/queue/clients";

export async function POST(_req: NextRequest) {
  await inngestEdgeClient.send({
    name: "dummy.event",
    data: {
      argument: "Hello world",
    },
  });

  return new NextResponse("OK")
}
