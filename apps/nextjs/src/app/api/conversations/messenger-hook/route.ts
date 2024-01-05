import type { NextApiRequest } from "next";
import { z } from "zod";

const validationRequestSchema = z.object({
  mode: z.string(),
  token: z.string(),
  challenge: z.string(),
});

// Webhook to validate Messenger's verification requests as per https://developers.facebook.com/docs/messenger-platform/webhooks#verification-requests
export async function GET(
  _req: NextApiRequest,
  { params }: { params: { mode: string; token: string; challenge: string } },
): Promise<Response> {
  const { mode, token, challenge } = validationRequestSchema.parse(params);

  // Check the mode and token sent is correct
  if (mode === "subscribe" && token === process.env.messengerVerifyToken) {
    // Respond with the challenge token from the request
    console.log("WEBHOOK_VERIFIED");
    return new Response(challenge, {
      status: 200,
    });
  } else {
    // Respond with '403 Forbidden' if verify tokens do not match
    return new Response("Unauthorized", { status: 403 });
  }
}
