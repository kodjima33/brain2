import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { DateTime } from "luxon";

import { inngestEdgeClient } from "@brain2/lib/queue/clients";

export async function POST(_req: NextRequest) {
  await inngestEdgeClient.send({
    name: "digest.batch",
    data: {
      span: "DAY",
      date: DateTime.now().minus({ days: 2 }).toISODate(),
    },
  });

  return new NextResponse("OK");
}
