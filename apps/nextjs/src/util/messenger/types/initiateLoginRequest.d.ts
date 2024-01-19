import type { Message } from "./message";
import type { Recipient } from "./recipient";

export interface InitiateLoginRequest {
  recipient: Recipient;
  message: Message;
}
