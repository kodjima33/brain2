import { NextResponse } from "next/server";
import { DateTime } from "luxon";

import { inngestEdgeClient } from "@brain2/lib/queue/clients";

export const runtime = "edge";

/**
 * Trigger a weekly batch for the current day
 */
export async function GET() {
  await inngestEdgeClient.send({
    name: "digest.batch",
    data: {
      span: "WEEK",
      date: DateTime.now().toISODate(),
    },
  });

  return new NextResponse("OK");
}
