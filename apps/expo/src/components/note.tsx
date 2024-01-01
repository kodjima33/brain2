import React from "react";
import { Text, View } from "react-native";
import { TrashIcon } from "lucide-react-native";
import { DateTime } from "luxon";

import type { Note } from "@brain2/db/client";

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

/**
 * A list item representing a note
 */
export function NoteListItem({ note }: NoteListItemProps) {
  const formattedDate = DateTime.fromISO(note.createdAt.toString()).toFormat(
    "ccc dd/MM/yyyy HH:mm:ss",
  );

  return (
    <View className="flex flex-col gap-2 bg-white px-4 py-2">
      <Text className="text-2xl font-semibold">{note.title}</Text>
      <Text className="text-md font-light text-gray-700">{formattedDate}</Text>
    </View>
  );
}
