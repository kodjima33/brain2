import { ChatOpenAI } from "langchain/chat_models/openai";
import { AIMessage, HumanMessage, SystemMessage } from "langchain/schema";

import type { Conversation } from "@brain2/db";

const chatModel = new ChatOpenAI({
  modelName: "gpt-4-1106-preview",
  temperature: 0.5,
});

const prompt =
  "You are a conversational note taking assistant called brain². A user is having a conversation with you about an interesting idea they encountered. Ask short, insightful questions that get the user to explore the idea they're sharing in detail. You may feel free to present questions that reveal rebuttals or counterpoints as well.";

// Generate a response to non "end note" messages
export async function generateConvResponse(
  conversation: Conversation,
): Promise<string> {
  const messages = [new SystemMessage(prompt)];

  conversation.userMessages.forEach((userMessage, i) => {
    messages.push(new HumanMessage(userMessage));
    messages.push(new AIMessage(conversation.brain2Messages[i] ?? ""));
  });

  const response = await chatModel.call(messages);

  return response.content.toString();
}
