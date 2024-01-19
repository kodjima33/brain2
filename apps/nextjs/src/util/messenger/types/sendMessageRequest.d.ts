import type { Message } from "./message";
import type { Recipient } from "./recipient";

export interface SendMessageRequest {
  recipient: Recipient;
  messaging_type: string;
  message: Message;
}
