import axios from "axios";

import type { SenderAction } from "./types/senderAction";
import type { SenderActionRequest } from "./types/senderActionRequest";
import { env } from "~/env";

// Mark a message as seen or turn the typing animation on
export async function sendMessengerAction(
  senderPSID: string,
  action: SenderAction,
): Promise<void> {
  const request: SenderActionRequest = {
    recipient: { id: senderPSID },
    sender_action: action,
  };

  await axios.post(env.MESSENGER_API_URL, request, {
    headers: {
      Authorization: `Bearer ${env.MESSENGER_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
}
