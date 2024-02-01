import migrateNoteRevision from "./migrations/migrateNoteRevision";

/**
 * Run a migration
 */
export default async function main() {
  await migrateNoteRevision();
}

void main();
