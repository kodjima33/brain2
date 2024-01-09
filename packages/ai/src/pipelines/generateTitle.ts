import { PromptTemplate, SystemMessagePromptTemplate } from "langchain/prompts";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

import type { NoteDigestSpan } from "@brain2/db";

import { createChatModel } from "../openai";

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

const titleParamSchema = z.object({ title: z.string() });

const titleFnSchema = {
  name: "save_title",
  description: "Save the title of the text",
  parameters: zodToJsonSchema(titleParamSchema),
};

/**
 * Create a title for a transcript
 */
export async function generateTranscriptTitle(
  transcription: string,
): Promise<string> {
  const chatModel = await createChatModel({
    modelName: "gpt-3.5-turbo",
    temperature: 0.1,
  });
  const response = await chatModel.invoke(
    [new SystemMessage(transcriptPrompt), new HumanMessage(transcription)],
    {
      functions: [titleFnSchema],
      function_call: {
        name: titleFnSchema.name,
      },
    },
  );

  const args = response.additional_kwargs.function_call?.arguments;
  const { title } = titleParamSchema.parse(JSON.parse(args!));
  return title;
}

/**
 * Create a title for a digest, given the span
 */
export async function generateDigestTitle(
  digest: string,
  span: NoteDigestSpan,
): Promise<string> {
  const response = await chatModel.invoke(
    [
      ...(await digestPromptTemplate.formatMessages({ span })),
      new HumanMessage(digest),
    ],
    {
      functions: [titleFnSchema],
      function_call: {
        name: titleFnSchema.name,
      },
    },
  );

  const args = response.additional_kwargs.function_call?.arguments;
  const { title } = titleParamSchema.parse(JSON.parse(args!));
  return title;
}
