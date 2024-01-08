import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate, SystemMessagePromptTemplate } from "langchain/prompts";
import { HumanMessage, SystemMessage } from "langchain/schema";

import { NoteDigestSpan } from "@brain2/db";

const chatModel = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.1,
});

const transcriptPrompt =
  "You will be provided with audio recording transcripts. Provide a concise 3-5 word title for the recording. Make sure to emphasize any important terms or highlights from the transcript.";

const digestPromptString =
  "You are a seasoned personal assistant. You have created a comprehensive digest of your client's notes from the past {{span}}. Provide a concise 3-5 word title for the digest.";

const digestPromptTemplate = new SystemMessagePromptTemplate({
  prompt: new PromptTemplate({
    template: digestPromptString,
    inputVariables: ["span"],
  }),
});

function cleanTitle(title: string): string {
  const text = title.trim();
  if (text.startsWith('"') && text.endsWith('"')) {
    return text.slice(1, -1);
  }
  return text;
}

/**
 * Create a title for a transcript
 */
export async function generateTranscriptTitle(
  transcription: string,
): Promise<string> {
  const response = await chatModel.call([
    new SystemMessage(transcriptPrompt),
    new HumanMessage(transcription),
  ]);

  return cleanTitle(response.content.toString());
}

/**
 * Create a title for a digest, given the span
 */
export async function generateDigestTitle(
  digest: string,
  span: NoteDigestSpan,
): Promise<string> {
  const response = await chatModel.call([
    ...(await digestPromptTemplate.formatMessages({ span })),
    new HumanMessage(digest),
  ]);

  return cleanTitle(response.content.toString());
}
