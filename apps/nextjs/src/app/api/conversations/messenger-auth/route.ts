import { auth } from "@clerk/nextjs";
import { z } from "zod";

import { generateId, prisma } from "@brain2/db";

import { sendMessage } from "~/util/messenger/sendMessage";

const messengerAuthSchema = z.object({
  messengerPSID: z.string(),
});

export async function POST(req: Request): Promise<Response> {
  const { userId } = auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const json = (await req.json()) as unknown;
  const { messengerPSID } = messengerAuthSchema.parse(json);

  const messengerUser = await prisma.messengerUser.create({
    data: {
      id: generateId("messengerUser"),
      messengerPSID: messengerPSID,
      clerkUserID: userId,
    },
  });

  await sendMessage(
    messengerPSID,
    `Thanks for logging in. We can now get started with building your Brain²! What do you want to talk about?`,
    false,
  );

  return Response.json(messengerUser);
}
