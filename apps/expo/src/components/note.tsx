import React from "react";
import { Text, View } from "react-native";
import { TrashIcon } from "lucide-react-native";
import { DateTime } from "luxon";

import type { Note, NoteRevision } from "@brain2/db/client";

export type PopulatedNote = Note & { revision: NoteRevision };

interface NoteCardProps {
  note: PopulatedNote;
}

/**
 * A subpanel unveiled when swiping a note list item to the left
 */
export function NoteListItemRightSwipeActions() {
  return (
    <View className="flex w-full flex-grow flex-col items-end justify-center gap-2 px-4 py-2">
      <View className="flex flex-col items-center justify-center rounded-full bg-red-500 p-4">
        <TrashIcon className="border-black-2 h-8 w-8 border text-white" />
      </View>
    </View>
  );
}

/**
 * A list item representing a note
 */
export function NoteCard({ note }: NoteCardProps) {
  // Prisma-returned JS date doesn't have toISOString() method
  const dateStringRaw =
    note.digestStartDate.toISOString?.() ?? note.digestStartDate.toString();
  const date = DateTime.fromISO(dateStringRaw);
  const dateString = date.toFormat("cccc, LLL dd");
  const timeString = date.toFormat("hh:mm a");

  return (
    <View className="flex flex-col gap-2 px-4 py-2">
      <View className="flex flex-col gap-2 rounded-2xl border border-black bg-white p-4">
        <Text className="text-lg font-semibold">{note.revision.title}</Text>
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
