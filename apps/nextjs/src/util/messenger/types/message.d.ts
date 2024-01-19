import type { Attachment } from "./attachment";
import type { QuickReplies } from "./quickReplies";

export interface Message {
  text?: string;
  quick_replies?: QuickReplies[];
  attachment?: Attachment;
}
