import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";

import type { ChatConversation } from "@brain2/db";
import { MessageAuthor } from "@brain2/db";

import { createChatModel } from "../openai";

const chatModel = await createChatModel({
  modelName: "gpt-4-1106-preview",
  temperature: 0.5,
});

const prompt =
  "You are a conversational note taking assistant called brain². A user is having a conversation with you about an interesting idea they encountered. Ask short, insightful questions that get the user to explore the idea they're sharing in detail. You may feel free to present questions that reveal rebuttals or counterpoints as well. Please limit each response to one follow up question or point. ";

const summaryGenPrompt =
  "You are a conversational note taking assistant called brain². You just had a conversation with a user about an interesting idea they encountered. Generate a comprehensive summary and synthesis of the notes. Think step-by-step to highlight and emphasize the most important points upfront before going into the details.";
// Generate a response to conversational captures.
export async function generateConvResponse(
  conversation: ChatConversation,
  lastMessage: string,
  isConvEnd: boolean, // is this message an "end note" message - then generate summary instead of continuing the conversation.
): Promise<string> {
  const messages = [new SystemMessage(isConvEnd ? summaryGenPrompt : prompt)];

  conversation.messages.forEach((message, _) => {
    switch (message.author) {
      case MessageAuthor.USER: {
        messages.push(new HumanMessage(message.text));
        break;
      }
      case MessageAuthor.BRAIN2: {
        messages.push(new AIMessage(message.text));
      }
    }
  });

  messages.push(new HumanMessage(lastMessage));

  const response = await chatModel.call(messages);

  return response.content.toString();
}
