import type { QuickReplies } from "./quickReplies";

export interface Message {
  text: string;
  quick_replies: QuickReplies[];
}
