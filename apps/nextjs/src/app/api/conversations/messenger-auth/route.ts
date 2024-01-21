import { currentUser } from "@clerk/nextjs";
import { z } from "zod";

import { prisma } from "@brain2/db";

import { sendMessage } from "~/util/messenger/sendMessage";

const messengerAuthSchema = z.object({
  messengerPSID: z.string(),
});

export async function POST(req: Request): Promise<Response> {
  try {
    const user = await currentUser();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const json = (await req.json()) as unknown;
    const { messengerPSID } = messengerAuthSchema.parse(json);

    const accountAlreadyLinked =
      (await prisma.messengerUser.findFirst({
        where: { userId: user.id },
      })) != null;

    const messengerUser = await prisma.messengerUser.upsert({
      where: { userId: user.id },
      update: {
        messengerPsid: messengerPSID,
      },
      create: {
        messengerPsid: messengerPSID,
        userId: user.id,
      },
    });

    if (!accountAlreadyLinked) {
      await sendMessage(
        messengerPSID,
        `Thanks for logging in ${user.firstName}. We can now get started with building your Brain²! What do you want to talk about?`,
        false,
      );
    }

    return Response.json(messengerUser);
  } catch (error) {
    console.log(error);
    return Response.json("Internal Server Error", { status: 500 });
  }
}
