import { HumanMessage, SystemMessage } from "langchain/schema";

import { createChatModel } from "../openai";

const prompt = `You are an expert multilingual speech transcriber. You will be provided with the transcript from an voice memo recording.
Fix any potential spelling mistakes. Where it makes sense, split the text into separate paragraphs so that \
it's easier to read.`;

/**
 * Refine transcript, correcting spelling mistakes and splitting paragraphs as needed
 */
export async function refineTranscript(text: string): Promise<string> {
  const chatModel = await createChatModel({
    modelName: "gpt-3.5-turbo",
    temperature: 0.1,
  });
  const response = await chatModel.invoke([
    new SystemMessage(prompt),
    new HumanMessage(text),
  ]);

  const title = response.content.toString().trim();
  if (title.startsWith('"') && title.endsWith('"')) {
    return title.slice(1, -1);
  }
  return title;
}
