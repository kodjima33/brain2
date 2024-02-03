"use client";

import { useState } from "react";
import { DateTime } from "luxon";

import type { Note, NoteDigestSpan, NoteRevision } from "@brain2/db";

import { cn } from "~/lib/utils";
import { Badge } from "./ui/badge";

export type PopulatedNote = Note & { revision: NoteRevision };

interface NoteViewProps {
  notes: PopulatedNote[];
  className?: string;
}

export function NoteView({ notes, className }: NoteViewProps) {
  const [span, setSpan] = useState<NoteDigestSpan>("SINGLE");
  const filteredNotes = notes.filter((note) => note.digestSpan === span);

  return (
    <div className={cn(className, "flex flex-col gap-2")}>
      <div className="flex flex-row gap-2">
        <Badge
          variant={span === "SINGLE" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSpan("SINGLE")}
        >
          Notes
        </Badge>
        <Badge
          variant={span === "DAY" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSpan("DAY")}
        >
          Dailies
        </Badge>
        <Badge
          variant={span === "WEEK" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSpan("WEEK")}
        >
          Weeklies
        </Badge>
      </div>
      <section className="flex flex-col gap-4">
        {filteredNotes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </section>
    </div>
  );
}

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
      <div className="flex flex-row gap-1">
        <p className="text-md font-light text-gray-700">{dateString}</p>
        {note.digestSpan == "SINGLE" ? (
          <p className="text-md font-light text-gray-700"> - {timeString}</p>
        ) : null}
      </div>
    </div>
  );
}
