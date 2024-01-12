import React from "react";
import { Text, View } from "react-native";
import { TrashIcon } from "lucide-react-native";
import { DateTime } from "luxon";

import type { Note, NoteDigestSpan } from "@brain2/db/client";

import Badge from "./badge";

interface NoteListItemProps {
  note: Note;
}

/**
 * A subpanel unveiled when swiping a note list item to the left
 */
export function NoteListItemRightSwipeActions() {
  return (
    <View className="flex w-full flex-grow flex-col items-end justify-center gap-2 bg-red-500 px-4 py-2 shadow-sm">
      <TrashIcon className="border-black-2 h-8 w-8 border text-white" />
    </View>
  );
}

export function getDateStringFromSpan(date: DateTime, span: NoteDigestSpan) {
  if (span === "SINGLE") {
    return date.toFormat("ccc dd/MM/yyyy HH:mm:ss");
  } else if (span === "DAY") {
    return date.toFormat("ccc dd/MM/yyyy");
  } else if (span === "WEEK") {
    const endDate = date.plus({ days: 6 });
    return `${date.toFormat("ccc dd/MM/yyyy")} - ${endDate.toFormat(
      "ccc dd/MM/yyyy",
    )}`;
  }
}

export const NOTE_BADGE_COLORS = {
  SINGLE: "bg-gray-200",
  DAY: "bg-yellow-100",
  WEEK: "bg-cyan-100",
};

/**
 * A list item representing a note
 */
export function NoteListItem({ note }: NoteListItemProps) {
  // Prisma-returned JS date doesn't have toISOString() method
  const dateStringRaw =
    note.createdAt.toISOString?.() ?? note.createdAt.toString();
  const date = DateTime.fromISO(dateStringRaw);
  const dateString = getDateStringFromSpan(date, note.digestSpan);

  return (
    <View className="flex flex-col gap-2 bg-white px-4 py-2">
      <Text className="text-2xl font-semibold">{note.title}</Text>
      <Text className="text-md font-light text-gray-700">{dateString}</Text>
      {note.digestSpan !== "SINGLE" ? (
        <Badge
          text={note.digestSpan}
          className={NOTE_BADGE_COLORS[note.digestSpan]}
        />
      ) : null}
    </View>
  );
}
