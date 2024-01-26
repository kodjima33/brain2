import { PromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";
import { DateTime } from "luxon";

import type { Note, NoteDigestSpan } from "@brain2/db";

import { createChatModel } from "../openai";

const promptString = `You are a seasoned personal assistant. You will be provided with multiple transcripts and notes over the past {{span}}. \
Come up with a comprehensive summary and synthesis of the notes.
Think step-by-step to highlight and emphasize the most important points upfront before going into the details.
When digging into the details, think about areas of reflection and improvement for me. I am always looking to improve myself.
Feel free to ask follow-up questions to help my thought process.

Use markdown to format the text as needed.`;

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
 * Create a digest of the provided notes
 */
export async function digestNotes(
  notes: Note[],
  span: NoteDigestSpan,
): Promise<string> {
  const noteMessages = notes.map(noteToMessage);
  
  const chatModel = await createChatModel({
    modelName: "gpt-4-1106-preview",
    temperature: 0.4,
  });
  const response = await chatModel.invoke([
    ...(await promptTemplate.formatMessages({ span })),
    ...noteMessages,
  ]);

  return response.content.toString();
}
