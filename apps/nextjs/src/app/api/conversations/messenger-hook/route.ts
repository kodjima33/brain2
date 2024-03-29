import type { NextRequest } from "next/server";
import { z } from "zod";

import type { ChatConversation } from "@brain2/db";
import { generateConvResponse } from "@brain2/ai";
import { generateId, MessageAuthor, prisma } from "@brain2/db";

import { env } from "~/env";
import {
  END_CONVO_MESSAGE,
  MAX_CONVERSATION_DURATION,
} from "~/util/messenger/constants";
import { initiateLogin } from "~/util/messenger/initiateLogin";
import { messageRequestSchema } from "~/util/messenger/requests/messageRequestSchema";
import { validationRequestSchema } from "~/util/messenger/requests/validationRequestSchema";
import { sendMessage } from "~/util/messenger/sendMessage";
import { sendMessengerAction } from "~/util/messenger/sendMessengerAction";

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

async function createNewConversation(
  ownerPSID: string,
  time: Date,
): Promise<ChatConversation> {
  const conversation = await prisma.chatConversation.create({
    data: {
      id: generateId("chatConversation"),
      ownerPSID,
      createdAt: time,
      updatedAt: time,
    },
  });

  return conversation;
}

// Gets current conversation for given user. Creates a new one if necessary.
async function getCurrentConversation(
  senderPSID: string,
  time: Date,
): Promise<ChatConversation> {
  // Look for conversations from this user that are active
  let conversation = await prisma.chatConversation.findFirst({
    where: { ownerPSID: senderPSID, isActive: true },
  });

  if (!conversation) {
    // Create conversation if it doesn't exist
    conversation = await createNewConversation(senderPSID, time);
  }

  // Check whether conversation is stale and create new one if so - longer than MAX_CONVERSATION_DURATION since last message
  if (
    time.getTime() - conversation.updatedAt.getTime() >
    MAX_CONVERSATION_DURATION
  ) {
    // Make existing conversation inactive and create a new one
    // TODO: asynchronously make a note from the conversation that just ended
    await prisma.chatConversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        isActive: false,
      },
    });

    conversation = await createNewConversation(senderPSID, time);
  }

  return conversation;
}

async function handleConvResponse(
  time: number,
  senderPSID: string,
  messageText: string,
): Promise<void> {
  // Mark message as seen and turn on the typing animation
  await sendMessengerAction(senderPSID, "mark_seen");
  // Automatically turned off after 20 seconds, or when the bot sends a message, so not worrying about turning it off
  await sendMessengerAction(senderPSID, "typing_on");

  const currentConversation = await getCurrentConversation(
    senderPSID,
    new Date(time),
  );

  // TODO: create note if isConvEnd is true

  const isConvEnd = messageText == END_CONVO_MESSAGE;

  const brain2Response = await generateConvResponse(
    currentConversation,
    messageText,
    isConvEnd,
  );

  await sendMessage(senderPSID, brain2Response, true);

  await prisma.chatConversation.update({
    where: {
      id: currentConversation.id,
    },
    data: {
      messages: [
        ...currentConversation.messages,
        { author: MessageAuthor.USER, text: messageText },
        { author: MessageAuthor.BRAIN2, text: brain2Response },
      ],
      updatedAt: new Date(),
      isActive: !isConvEnd,
    },
  });
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

    if (!(time && message && senderPSID && messageText)) {
      throw z.ZodError;
    }

    console.log(messageText, message, senderPSID);

    const messengerUser = await prisma.messengerUser.findUnique({
      where: { messengerPsid: senderPSID },
    });

    if (!messengerUser) {
      // Messenger login flow because we haven't seen this user before.
      await initiateLogin(senderPSID);
    } else {
      await handleConvResponse(time, senderPSID, messageText);
    }

    return Response.json("success");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json("Webhook not supported", { status: 400 });
    } else {
      console.log(error);
      return Response.json("Internal Server Error", { status: 500 });
    }
  }
}
