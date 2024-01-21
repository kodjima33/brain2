import type { Callbacks } from "langchain/callbacks";
import { ChatOpenAI } from "@langchain/openai";

export interface CreateChatModelParams {
  modelName: string;
  maxTokens?: number;
  temperature?: number;
  callbacks?: Callbacks;
  cache?: boolean;
}

/**
 * Create a chat model
 */
export async function createChatModel({
  modelName,
  maxTokens,
  temperature,
  callbacks,
}: CreateChatModelParams) {
  return new ChatOpenAI({
    modelName,
    maxTokens,
    temperature,
    callbacks,
  });
}
