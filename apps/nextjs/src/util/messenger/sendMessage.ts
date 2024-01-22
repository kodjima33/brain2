import axios from "axios";

import type { SendMessageRequest } from "./types/sendMessageRequest";
import { DEFAULT_MESSENGER_QUICK_REPLIES } from "./constants";
import { env } from "~/env";

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
      ...(includeQuickReplies
        ? { quick_replies: DEFAULT_MESSENGER_QUICK_REPLIES }
        : {}),
    },
  };

  await axios.post(env.MESSENGER_API_URL, request, {
    headers: {
      Authorization: `Bearer ${env.MESSENGER_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
}
