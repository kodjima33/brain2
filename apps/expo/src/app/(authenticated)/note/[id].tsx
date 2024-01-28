import { useCallback, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import Markdown from "react-native-markdown-display";
import { Stack, useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon, PencilIcon, SearchIcon } from "lucide-react-native";
import { DateTime } from "luxon";

import type { Note } from "@brain2/db/client";

import Avatar from "~/components/avatar";
import { getNoteById } from "~/utils/api";

interface NoteViewProps {
  note: Note;
  loading: boolean;
  refetch: () => Promise<unknown>;
}

function NoteView({ note, loading, refetch }: NoteViewProps) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const date = DateTime.fromISO(note.digestStartDate.toString());
  const dateString = date.toFormat("cccc, LLL dd");
  const timeString = date.toFormat("hh:mm a");

  return (
    <View className="mb-12 flex flex-col gap-2">
      <Text className="text-3xl">{note.title}</Text>
      <View className="flex flex-col gap-1">
        <Text className="text-md font-light text-gray-700">{dateString}</Text>
        {note.digestSpan == "SINGLE" ? (
          <Text className="text-md font-light text-gray-700">{timeString}</Text>
        ) : null}
      </View>
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
        <Markdown>{note.content}</Markdown>
      </ScrollView>
    </View>
  );
}

export default function NotePage() {
  const { id } = useLocalSearchParams();
  const { isLoaded: isUserLoaded, getToken } = useAuth();

  const {
    data: note,
    error: noteError,
    isLoading: noteLoading,
    refetch,
  } = useQuery({
    queryKey: [id],
    queryFn: async () => {
      const token = await getToken();
      return getNoteById(id as string, token!);
    },
    enabled: isUserLoaded,
  });

  if (noteError) {
    console.error(noteError);
  }

  return (
    <SafeAreaView className="bg-white pt-10">
      <Stack.Screen
        options={{
          headerRight: () => {
            return (
              <View className="flex flex-row items-center gap-5">
                <Pressable>
                  <PencilIcon className="h-10 w-10 text-black" />
                </Pressable>
                <Avatar />
              </View>
            );
          },
        }}
      />
      {/* Changes page title visible on the header */}
      <View className="flex h-full w-full flex-col justify-between pb-5">
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
