import type { QuickReplies } from "./types/quickReplies";

export const MAX_CONVERSATION_DURATION = 24 * 60 * 60 * 1000;
export const END_CONVO_MESSAGE = "end note";

export const DEFAULT_MESSENGER_QUICK_REPLIES: QuickReplies[] = [
  { title: END_CONVO_MESSAGE, payload: 0, content_type: "text" },
  {
    title: "ask something else",
    payload: 1,
    content_type: "text",
  },
];
