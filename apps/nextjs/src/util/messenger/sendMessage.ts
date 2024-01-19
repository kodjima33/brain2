import axios from "axios";

import { env } from "@brain2/ai";

import type { SendMessageRequest } from "./types/sendMessageRequest";
import { DEFAULT_MESSENGER_QUICK_REPLIES } from "./constants";

// Send a message by calling the messenger API.
export async function sendMessage(
  senderPSID: string,
  message: string,
  includeQuickReplies: boolean,
): Promise<void> {
  const request: SendMessageRequest = {
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
