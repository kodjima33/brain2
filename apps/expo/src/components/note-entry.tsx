import React from "react";
import { Text, View } from "react-native";
import { DateTime } from "luxon";

import type { Note } from "@brain2/db/client";

interface NoteEntryProps {
  note: Note;
}

/**
 * A list item representing a note
 */
export default function NoteEntry({ note }: NoteEntryProps) {
  const formattedDate = DateTime.fromISO(note.createdAt.toString()).toFormat(
    "ccc dd/MM/yyyy HH:mm:ss",
  );

  return (
    <View className="flex flex-col gap-2 p-4">
      <Text className="text-2xl font-semibold">{note.title}</Text>
      <Text className="text-md font-light text-gray-700">{formattedDate}</Text>
    </View>
  );
}
