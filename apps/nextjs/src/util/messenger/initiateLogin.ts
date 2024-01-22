import axios from "axios";

import type { InitiateLoginRequest } from "./types/initiateLoginRequest";
import { env } from "~/env";

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
              type: "web_url",
              url: `${env.VERCEL_PROD_URL}/messenger-auth?messengerPSID=${senderPSID}`,
              title: "Log In",
              webview_height_ratio: "full",
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
