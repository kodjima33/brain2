import type { NextRequest } from "next/server";
import { DateTime } from "luxon";
import { z } from "zod";

import { Conversation, generateId, prisma } from "@brain2/db";

import { env } from "~/env";

const MAX_CONVERSATION_DURATION = 24 * 60 * 60 * 1000;

const validationRequestSchema = z.object({
  mode: z.string(),
  verify_token: z.string(),
  challenge: z.string(),
});

// Webhook to validate Messenger's verification requests as per https://developers.facebook.com/docs/messenger-platform/webhooks#verification-requests
export async function GET(req: NextRequest): Promise<Response> {
  const queryParams = req.nextUrl.searchParams;
  const { mode, verify_token, challenge } = validationRequestSchema.parse({
    mode: queryParams.get("hub.mode"),
    verify_token: queryParams.get("hub.verify_token"),
    challenge: queryParams.get("hub.challenge"),
  });

  // Check the mode and token sent is correct
  if (mode === "subscribe" && verify_token === env.MESSENGER_VERIFY_TOKEN) {
    // Respond with the challenge token from the request
    console.log("WEBHOOK_VERIFIED");
    return new Response(challenge, {
      status: 200,
    });
  } else {
    // Respond with '403 Forbidden' if verify tokens do not match
    return new Response("Unauthorized. Validation failed.", { status: 403 });
  }
}

// Defined based on docs here - https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messages#message-with-fallback-attachment
// Not entirely sure what all the fields are - just using the message text, time and senderID for now.
const messageRequestSchema = z.object({
  entry: z.array(
    z.object({
      time: z.number(),
      messaging: z.array(
        z.object({
          sender: z.object({
            id: z.string(),
          }),
          message: z.object({
            text: z.string(),
          }),
        }),
      ),
    }),
  ),
});

async function createNewConversation(
  ownerPSID: string,
  time: Date,
): Promise<Conversation> {
  const conversation = await prisma.conversation.create({
    data: {
      id: generateId("conversation"),
      ownerPSID,
      createdAt: time,
      lastUpdatedAt: time,
    },
  });

  return conversation;
}

//
async function getConversation(
  senderPSID: string,
  time: Date,
): Promise<Conversation> {
  // Look for conversations from this user that are active
  let conversation = await prisma.conversation.findFirst({
    where: { ownerPSID: senderPSID, isActive: true },
  });

  if (!conversation) {
    // Create conversation if it doesn't exist
    conversation = await createNewConversation(senderPSID, time);
  }

  // Check whether conversation is stale - longer than MAX_CONVERSATION_DURATION since last message
  if (
    time.getTime() - conversation.lastUpdatedAt.getTime() >
    MAX_CONVERSATION_DURATION
  ) {
  }
}

// Webhook invoked when a message is received on messenger, i.e. conversational capture is invoked
export async function POST(req: Request): Promise<Response> {
  const json = (await req.json()) as unknown;

  try {
    const parsedRequest = messageRequestSchema.parse(json).entry[0];

    const time = parsedRequest?.time;
    const message = parsedRequest?.messaging[0];

    const senderPSID = message?.sender.id;
    const messageText = message?.message.text;

    console.log(time, senderPSID, messageText);

    return Response.json("success");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json("Webhook not supported", { status: 400 });
    } else {
      return Response.json("Internal Server Error", { status: 500 });
    }
  }
}
