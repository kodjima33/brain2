import type { DrawerNavigationHelpers } from "@react-navigation/drawer/lib/typescript/src/types";
import { useCallback, useState } from "react";
import { SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { RefreshControl, TouchableOpacity } from "react-native-gesture-handler";
import { useQuery } from "@tanstack/react-query";
import {
  CircleUserRoundIcon,
  Loader2Icon,
  MenuIcon,
} from "lucide-react-native";
import { DateTime } from "luxon";

import type { Note } from "@brain2/db/client";

import Sidebar from "~/components/sidebar";
import { getNoteById } from "~/utils/api";

export interface NoteViewProps {
  note: Note;
  loading: boolean;
  refetch: () => Promise<void>;
}

function NoteView({ note, loading, refetch }: NoteViewProps) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const formattedDate = DateTime.fromISO(note.createdAt.toString()).toFormat(
    "ccc dd/MM/yyyy HH:mm a",
  );

  return (
    <View className="mb-12 flex flex-col gap-2">
      <Text className="text-3xl">{note.title}</Text>
      <Text className="text-sm font-light text-gray-500">{formattedDate}</Text>
      <ScrollView
        className="flex-grow"
        overScrollMode="always"
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={onRefresh}
          />
        }
      >
        <Text className="whitespace-pre text-lg">{note.content}</Text>
      </ScrollView>
    </View>
  );
}

interface NotePageContentProps {
  navigation: DrawerNavigationHelpers;
  route?: {
    params: Record<string, string>;
  };
}

export function NotePageContent({ navigation, route }: NotePageContentProps) {
  const id = route?.params?.id;
  if (!id || typeof id !== "string") throw new Error("unreachable");

  const {
    data: note,
    error: noteError,
    isLoading: noteLoading,
    refetch,
  } = useQuery({
    queryKey: [id],
    queryFn: async () => await getNoteById(id),
  });

  if (noteError) {
    console.error(noteError);
  }

  return (
    <SafeAreaView className="bg-white">
      {/* Changes page title visible on the header */}
      <View className="flex h-full w-full flex-col justify-between pb-5">
        {/* Header */}
        <View className="flex w-full flex-row items-center justify-between px-4">
          <TouchableOpacity
            onPress={() => {
              navigation.openDrawer();
            }}
          >
            <MenuIcon className="basis-1/12 text-black" />
          </TouchableOpacity>
          <TextInput
            className="h-10 basis-8/12 rounded-full border border-black px-4 py-2"
            placeholder="Search..."
          />
          <CircleUserRoundIcon className="basis-1/12 text-black" />
        </View>
        {/* Content */}
        <View className="flex flex-grow flex-col items-start justify-start gap-2 p-4">
          {noteLoading && (
            <View className="flex h-[50vh] w-full items-center justify-center">
              <Loader2Icon size={48} className="animate-spin text-gray-400" />
            </View>
          )}
          {!noteLoading && note == null && (
            <View className="flex h-[50vh] w-full items-center justify-center">
              <Text className="text-xl font-semibold text-gray-500">
                Could not find your note!
              </Text>
            </View>
          )}
          {note != null && (
            <NoteView note={note} loading={noteLoading} refetch={refetch} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

/**
 * Page to view a single note
 */
export default function NotePage() {
  return <Sidebar />;
}
