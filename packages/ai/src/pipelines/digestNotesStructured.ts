import { HumanMessage } from "@langchain/core/messages";
import {
  PromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { DateTime } from "luxon";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

import type { Note, NoteDigestSpan } from "@brain2/db";

import { createChatModel } from "../openai";

const promptString = `You are a seasoned personal assistant. You will be provided with multiple transcripts and notes over the past {{span}}. \
Think step-by-step and create a comprehensive summary of the highlights, as well as synthesize areas of interest or personal reflection.
Use markdown to format the text as needed.`;

const digestParamSchema = z.object({
  title: z
    .string()
    .describe(
      "A concise title encompassing the past day's activities and highlights",
    ),
  highlights: z
    .string()
    .describe(
      "Major highlights from the past day. Prefer to use lists and bullet points.",
    ),
  reflection: z
    .string()
    .describe(
      "Areas of interest and possible future exploration, based on the transcripts. The tone should be personal and reflective. ",
    ),
  nextSteps: z
    .string()
    .optional()
    .describe("Further reflection questions or calls to action, if needed."),
});

const digestFnSchema = {
  name: "save_digest",
  description: "Save the digest of the past day's activities and highlights",
  parameters: zodToJsonSchema(digestParamSchema),
};

const promptTemplate = new SystemMessagePromptTemplate({
  prompt: new PromptTemplate({
    template: promptString,
    inputVariables: ["span"],
  }),
});

function noteToMessage(note: Note): HumanMessage {
  const components = [
    ["Title: ", note.title],
    [
      "Date: ",
      DateTime.fromISO(note.createdAt.toString()).toFormat("yyyy-MM-dd HH:mm"),
    ],
    ["Content: \n", note.content],
  ];
  const message = components
    .map(([prefix, content]) => `${prefix}${content}`)
    .join("\n\n####################\n\n");
  return new HumanMessage(message);
}

/**
 * Create a digest over the provided notes, using function calling to constrain the output
 */
export async function digestNotesStructured(
  notes: Note[],
  span: NoteDigestSpan,
): Promise<z.infer<typeof digestParamSchema>> {
  const noteMessages = notes.map(noteToMessage);

  const chatModel = await createChatModel({
    modelName: "gpt-4-turbo-preview",
    temperature: 0.4,
  });
  const response = await chatModel.invoke(
    [...(await promptTemplate.formatMessages({ span })), ...noteMessages],
    {
      functions: [digestFnSchema],
      function_call: {
        name: digestFnSchema.name,
      },
    },
  );

  const args = response.additional_kwargs.function_call?.arguments;
  return digestParamSchema.parse(JSON.parse(args ?? ""));
}
