import { HumanMessage } from "@langchain/core/messages";
import {
  PromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { DateTime } from "luxon";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

import type { Note, NoteDigestSpan, NoteRevision } from "@brain2/db/edge";

import { createChatModel } from "../openai";

type PopulatedNote = Note & { revision: NoteRevision };

const promptString = `You are a seasoned personal assistant. You will be provided with multiple transcripts and notes over the past {{span}}. \
Think step-by-step and create a comprehensive summary of the highlights. Use markdown to format the text as needed.`;

const summarizeSchema = z.object({
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
});

const summarizeFnSchema = {
  name: "save_summary",
  description: "Save the summary of the past day's activities and highlights",
  parameters: zodToJsonSchema(summarizeSchema),
};

const promptTemplate = new SystemMessagePromptTemplate({
  prompt: new PromptTemplate({
    template: promptString,
    inputVariables: ["span"],
  }),
});

function noteToMessage(note: PopulatedNote): HumanMessage {
  const components = [
    ["Title: ", note.revision.title],
    [
      "Date: ",
      DateTime.fromISO(
        note.createdAt.toISOString?.() ?? note.createdAt.toString(),
      ).toFormat("yyyy-MM-dd HH:mm"),
    ],
    ["Content: \n\n", note.revision.content],
  ];
  const message = components
    .map(([prefix, content]) => `${prefix}${content}`)
    .join("\n");
  return new HumanMessage(message);
}

/**
 * Summarize a set of notes, and return a summary of the highlights
 */
export async function summarizeNotes(
  notes: PopulatedNote[],
  span: NoteDigestSpan,
): Promise<z.infer<typeof summarizeSchema>> {
  const chatModel = await createChatModel({
    modelName: "gpt-4-turbo-preview",
    temperature: 0.4,
  });

  const noteMessages = notes.map(noteToMessage);
  const response = await chatModel.invoke(
    [...(await promptTemplate.formatMessages({ span })), ...noteMessages],
    {
      functions: [summarizeFnSchema],
      function_call: {
        name: summarizeFnSchema.name,
      },
    },
  );

  const args = response.additional_kwargs.function_call?.arguments;
  return summarizeSchema.parse(JSON.parse(args ?? ""));
}
