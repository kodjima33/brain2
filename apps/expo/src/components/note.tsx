import React from "react";
import { Text, View } from "react-native";
import { TrashIcon } from "lucide-react-native";
import { DateTime } from "luxon";

import type { Note, NoteDigestSpan } from "@brain2/db/client";

import Badge from "./badge";

interface NoteCardProps {
  note: Note;
}

/**
 * A subpanel unveiled when swiping a note list item to the left
 */
export function NoteListItemRightSwipeActions() {
  return (
    <View className="flex w-full flex-grow flex-col items-end justify-center gap-2 px-4 py-2">
      <View className="flex flex-col items-center justify-center bg-red-500 p-4 rounded-full">
        <TrashIcon className="border-black-2 h-8 w-8 border text-white" />
      </View>
    </View>
  );
}

export function getDateStringFromSpan(date: DateTime, span: NoteDigestSpan) {
  if (span === "SINGLE") {
    return date.toFormat("cccc, LLL dd");
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
export function NoteCard({ note }: NoteCardProps) {
  // Prisma-returned JS date doesn't have toISOString() method
  const dateStringRaw =
    note.createdAt.toISOString?.() ?? note.createdAt.toString();
  const date = DateTime.fromISO(dateStringRaw);
  const dateString = date.toFormat("cccc, LLL dd");
  const timeString = date.toFormat("hh:mm a");

  return (
    <View className="flex flex-col gap-2 px-4 py-2">
      <View className="flex flex-col gap-2 rounded-2xl border border-black bg-white p-4">
        <Text className="text-2xl font-semibold">{note.title}</Text>
        <View className="flex flex-col gap-1">
          <Text className="text-md font-light text-gray-700">{dateString}</Text>
          {note.digestSpan == "SINGLE" ? (
            <Text className="text-md font-light text-gray-700">
              {timeString}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
