"use client";

import { DateTime } from "luxon";

import type { Note, NoteRevision } from "@brain2/db";

export type PopulatedNote = Note & { revision: NoteRevision };

interface NoteCardProps {
  note: PopulatedNote;
}

export function NoteCard({ note }: NoteCardProps) {
  // Prisma-returned JS date doesn't have toISOString() method
  const dateStringRaw =
    note.digestStartDate.toISOString?.() ?? note.digestStartDate.toString();
  const date = DateTime.fromISO(dateStringRaw);
  const dateString = date.toFormat("cccc, LLL dd");
  const timeString = date.toFormat("hh:mm a");

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-black bg-white p-4">
      <p className="text-lg font-semibold">{note.revision.title}</p>
      <div className="flex flex-col gap-1">
        <p className="text-md font-light text-gray-700">{dateString}</p>
        {note.digestSpan == "SINGLE" ? (
          <p className="text-md font-light text-gray-700">{timeString}</p>
        ) : null}
      </div>
    </div>
  );
}
