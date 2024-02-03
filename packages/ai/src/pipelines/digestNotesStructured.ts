import type { BaseMessage } from "@langchain/core/messages";
import { AIMessage, FunctionMessage } from "@langchain/core/messages";
import {
  PromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { DateTime } from "luxon";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

import type { Note, NoteDigestSpan, NoteRevision } from "@brain2/db/edge";
import { prisma } from "@brain2/db/edge";

import { getSimilarNotes } from "../retrieval";
import { createChatModel } from "../openai";
import { summarizeNotes } from "./summarizeNotes";

type PopulatedNote = Note & { revision: NoteRevision };

const promptString = `You are a seasoned personal assistant. You will be provided with multiple transcripts and notes over the past {{span}}. \
You will then be provided with a summary and potentially related notes.
Think step-by-step to write a personal reflection on these highlights and connect them to areas of interest and potentially some past notes.
Use markdown to format the text as needed.`;

const digestParamSchema = z.object({
  relevantNoteIds: z
    .string()
    .describe(
      "The IDs of the provided similar notes, which are actually relevant to this digest",
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

const getLastNotesFnSchema = {
  name: "get_last_notes",
  description: "Get the most recent notes over a given time period",
  parameters: zodToJsonSchema(z.object({ span: z.enum(["DAY", "WEEK"]) })),
};

const getSimilarNotesFnSchema = {
  name: "get_similar_notes",
  description: "Get similar notes that are potentially relevant",
  parameters: zodToJsonSchema(z.void()),
};

const promptTemplate = new SystemMessagePromptTemplate({
  prompt: new PromptTemplate({
    template: promptString,
    inputVariables: ["span"],
  }),
});

interface SerializedNote {
  title: string;
  date: string;
  content: string;
}

function serializeNote(note: PopulatedNote): SerializedNote {
  return {
    title: note.revision.title,
    date: DateTime.fromISO(
      note.createdAt.toISOString?.() ?? note.createdAt.toString(),
    ).toFormat("yyyy-MM-dd HH:mm"),
    content: note.revision.content,
  };
}

const RETRIEVAL_COUNT = 10;

async function prepareMessages(notes: PopulatedNote[], span: NoteDigestSpan) {
  // Seed with system prompt
  const messages: BaseMessage[] = [
    ...(await promptTemplate.formatMessages({ span })),
  ];

  // Push summary/highlight messages
  const { title, highlights } = await summarizeNotes(notes, span);
  const serializedNotes = notes.map(serializeNote);
  messages.push(
    new AIMessage({
      content: "",
      additional_kwargs: {
        function_call: {
          name: "get_last_notes",
          arguments: JSON.stringify({ span }),
        },
      },
    }),
    new FunctionMessage({
      name: "get_last_notes",
      content: JSON.stringify(serializedNotes),
    }),
    new AIMessage({
      content: "",
      additional_kwargs: {
        function_call: {
          name: "save_summary",
          arguments: JSON.stringify({ title, highlights }),
        },
      },
    }),
    new FunctionMessage({
      name: "save_summary",
      content: "true",
    }),
  );

  const refNote = notes[0];
  if (refNote == null) {
    throw new Error("Bad state! First note in digest set is null!");
  }

  // Find similar notes for digest
  const similarNotes = await getSimilarNotes(
    highlights,
    refNote.owner,
    refNote.digestSpan,
    RETRIEVAL_COUNT,
  );

  // Populate similar notes
  const populatedSimilarNotes = await prisma.note.findMany({
    where: {
      id: {
        in: similarNotes.map((note) => note.metadata.id),
      },
    },
    include: {
      revision: true,
    },
  });

  // Push related notes messages
  messages.push(
    new AIMessage({
      content: "",
      additional_kwargs: {
        function_call: {
          name: "get_similar_notes",
          arguments: JSON.stringify({ span }),
        },
      },
    }),
    new FunctionMessage({
      name: "get_similar_notes",
      content: JSON.stringify(
        populatedSimilarNotes.map((note) => ({
          id: note.id,
          title: note.revision.title,
          content: note.revision.content,
          createdAt: DateTime.fromISO(
            note.createdAt.toISOString?.() ?? note.createdAt.toString(),
          ).toFormat("yyyy-MM-dd HH:mm"),
        })),
      ),
    }),
  );

  return { title, highlights, messages };
}

interface DigestNotesResult {
  title: string;
  highlights: string;
  reflection: string;
  nextSteps?: string;
}

/**
 * Create a digest over the provided notes, using function calling to constrain the output
 */
export async function digestNotesStructured(
  notes: PopulatedNote[],
  span: NoteDigestSpan,
): Promise<DigestNotesResult> {
  if (notes.length === 0) {
    throw new Error("No notes provided");
  }

  const chatModel = await createChatModel({
    modelName: "gpt-4-turbo-preview",
    temperature: 0.4,
  });

  const { title, highlights, messages } = await prepareMessages(notes, span);
  const response = await chatModel.invoke(messages, {
    functions: [digestFnSchema, getLastNotesFnSchema, getSimilarNotesFnSchema],
    function_call: {
      name: digestFnSchema.name,
    },
  });

  const args = response.additional_kwargs.function_call?.arguments;
  const { relevantNoteIds, reflection, nextSteps } = digestParamSchema.parse(
    JSON.parse(args ?? ""),
  );

  console.log("Relevant note ids", relevantNoteIds);

  return { title, highlights, reflection, nextSteps };
}
