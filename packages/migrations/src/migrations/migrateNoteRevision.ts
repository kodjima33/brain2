import { generateId, prisma } from "@brain2/db";

/**
 * Create note revisions for each note and delete their contents
 */
export default async function migrateNoteRevision() {
  // Create revisions
  const notes = await prisma.note.findMany();
  await prisma.noteRevision.createMany({
    data: notes.map((note) => ({
      id: generateId("noteRevision"),
      noteId: note.id,
      title: note.title!,
      content: note.content!,
    })),
  });

  // Update active revision
  const noteRevisions = await prisma.noteRevision.findMany();
  await prisma.$transaction(
    noteRevisions.map((revision) =>
      prisma.note.update({
        where: {
          id: revision.noteId,
        },
        data: {
          activeRevisionId: revision.id,
        },
      }),
    ),
  );
}
