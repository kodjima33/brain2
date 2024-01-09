import type { NextRequest } from "next/server";
import axios from "axios";
import { z } from "zod";

import type { Conversation } from "@brain2/db";
import { generateId, prisma } from "@brain2/db";

import { env } from "~/env";
import { generateConvResponse } from "~/util/generateConvResponse";

interface MessengerRecipient {
  id: string;
}

interface MessengerQuickReplies {
  content_type: string;
  title: string;
  payload: number;
}

interface MessengerMsg {
  text: string;
  quick_replies: MessengerQuickReplies[];
}

interface MessengerRequest {
  recipient: MessengerRecipient;
  messaging_type: string;
  message: MessengerMsg;
}

const MAX_CONVERSATION_DURATION = 24 * 60 * 60 * 1000;
const END_CONVO_MESSAGE = "end note";

const DEFAULT_MESSENGER_QUICK_REPLIES: MessengerQuickReplies[] = [
  { title: END_CONVO_MESSAGE, payload: 0, content_type: "text" },
  {
    title: "ask something else",
    payload: 1,
    content_type: "text",
  },
];

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

// Gets current conversation for given user. Creates a new one if necessary.
async function getCurrentConversation(
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

  // Check whether conversation is stale and create new one if so - longer than MAX_CONVERSATION_DURATION since last message
  if (
    time.getTime() - conversation.lastUpdatedAt.getTime() >
    MAX_CONVERSATION_DURATION
  ) {
    // Make existing conversation inactive and create a new one
    // TODO: asynchronously make a note from the conversation that just ended
    await prisma.conversation.update({
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

// Send a message by calling the messenger API.
async function sendMessage(
  senderPSID: string,
  message: string,
  includeQuickReplies: boolean,
): Promise<void> {
  const request: MessengerRequest = {
    recipient: { id: senderPSID },
    messaging_type: "RESPONSE",
    message: {
      text: message,
      quick_replies: includeQuickReplies ? DEFAULT_MESSENGER_QUICK_REPLIES : [],
    },
  };

  await axios.post(env.MESSENGER_API_URL, request, {
    headers: {
      Authorization: `Bearer ${env.MESSENGER_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
}

async function handleConvResponse(
  time: number,
  senderPSID: string,
  messageText: string,
): Promise<void> {
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

  await prisma.conversation.update({
    where: {
      id: currentConversation.id,
    },
    data: {
      userMessages: [...currentConversation.userMessages, messageText],
      brain2Messages: [...currentConversation.brain2Messages, brain2Response],
      lastUpdatedAt: new Date(),
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

    console.log(messageText, message);

    void handleConvResponse(time, senderPSID, messageText);

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
