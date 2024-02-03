import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from "@langchain/core/documents";

import type { Note, NoteRevision } from "@brain2/db";

import { env } from "..";

const pinecone = new Pinecone();
const index = pinecone.Index(env.PINECONE_INDEX);

type PopulatedNote = Note & { revision: NoteRevision };

/**
 * Get the vector store for retrieval
 */
export async function getVectorStore() {
  return PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({
      modelName: "text-embedding-3-large",
      dimensions: 1024,
    }),
    {
      pineconeIndex: index,
    },
  );
}

function getDocumentFromNote(note: PopulatedNote) {
  return new Document({
    metadata: {
      id: note.id,
      type: "note",
      span: note.digestSpan,
      owner: note.owner,
      active: note.active,
    },
    pageContent: `${note.revision.title}\n${note.revision.content}`,
  });
}

/**
 * Create an embedding for a note and save it to the vector store
 */
export async function embedNote(note: PopulatedNote) {
  const vectorStore = await getVectorStore();
  await vectorStore.addDocuments([getDocumentFromNote(note)], {
    ids: [note.id],
  });
}

export async function embedNotes(notes: PopulatedNote[]) {
  const vectorStore = await getVectorStore();
  await vectorStore.addDocuments(notes.map(getDocumentFromNote), {
    ids: notes.map((note) => note.id),
  });
}

/**
 * Get the k most similar notes to a given note
 */
export async function getSimilarNotes(note: PopulatedNote, k: number) {
  const vectorStore = await getVectorStore();
  const query = getDocumentFromNote(note).pageContent;
  const results = await vectorStore.similaritySearch(query, k, {
    owner: note.id,
    type: "note",
    span: note.digestSpan,
    active: true,
  });
  return results;
}
