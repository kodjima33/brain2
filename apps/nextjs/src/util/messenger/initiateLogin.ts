import axios from "axios";

import { env } from "@brain2/ai";

import type { InitiateLoginRequest } from "./types/initiateLoginRequest";

export async function initiateLogin(senderPSID: string): Promise<void> {
  const loginMsg: InitiateLoginRequest = {
    recipient: { id: senderPSID },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Before we get started, we need you to login so we can keep track of your conversations, and notes :)",
          buttons: [
            {
              type: "account_link",
              url: `${env.VERCEL_URL}/messenger-auth`,
            },
          ],
        },
      },
    },
  };

  await axios.post(env.MESSENGER_API_URL, loginMsg, {
    headers: {
      Authorization: `Bearer ${env.MESSENGER_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
}
