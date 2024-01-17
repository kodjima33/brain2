import type { Recipient } from "./recipient";
import type { SenderAction } from "./senderAction";

export interface SenderActionRequest {
  recipient: Recipient;
  sender_action: SenderAction;
}
