import type { Message } from "./message";
import type { Recipient } from "./recipient";

export interface HookRequest {
  recipient: Recipient;
  messaging_type: string;
  message: Message;
}
