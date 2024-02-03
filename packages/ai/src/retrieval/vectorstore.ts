import type { DocumentInterface } from "@langchain/core/documents";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

import type { Note, NoteDigestSpan, NoteRevision } from "@brain2/db/edge";

import { env } from "..";

const pinecone = new Pinecone();
const index = pinecone.Index(env.PINECONE_INDEX);

type PopulatedNote = Note & { revision: NoteRevision };

export interface NoteMetadata {
  id: string;
  type: "note";
  span: NoteDigestSpan;
  owner: string;
  active: boolean;
}

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
export async function getSimilarNotes(
  query: string,
  owner: string,
  span: NoteDigestSpan,
  k: number,
): Promise<DocumentInterface<NoteMetadata>[]> {
  const vectorStore = await getVectorStore();
  const results = await vectorStore.similaritySearch(query, k, {
    owner,
    type: "note",
    span,
    active: true,
  });
  return results as DocumentInterface<NoteMetadata>[];
}
