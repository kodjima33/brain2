import type { DrawerNavigationHelpers } from "@react-navigation/drawer/lib/typescript/src/types";
import type { Recording } from "expo-av/build/Audio";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CircleUserRoundIcon,
  Loader2Icon,
  MenuIcon,
  MicIcon,
  SquareIcon,
} from "lucide-react-native";

import NoteEntry from "~/components/note-entry";
import Sidebar from "~/components/sidebar";
import { getNotes, uploadRecording } from "~/utils/api";
import { startRecording, stopRecording } from "~/utils/audio";

interface ContentPageProps {
  navigation: DrawerNavigationHelpers;
}

function ContentPage({ navigation }: ContentPageProps) {
  const queryClient = useQueryClient();

  const {
    data: notes,
    error: notesError,
    isLoading: notesLoading,
  } = useQuery({
    queryKey: ["notes"],
    queryFn: getNotes,
  });

  if (notesError) {
    console.error("[getNotes] Query error:", notesError);
  }

  const [recording, setRecording] = useState<Recording | null>();

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
        <View className="flex flex-grow flex-col items-start justify-start gap-2">
          {notesLoading && (
            <View className="flex h-[50vh] w-full items-center justify-center">
              <Loader2Icon size={48} className="animate-spin text-gray-400" />
            </View>
          )}
          {!notesLoading && notes?.length === 0 && (
            <View className="flex h-[50vh] w-full items-center justify-center">
              <Text className="text-xl font-semibold text-gray-500">
                Nothing here yet!
              </Text>
            </View>
          )}
          {notes?.map((note) => <NoteEntry key={note.id} note={note} />)}
        </View>
        {/* FAB */}
        <TouchableOpacity
          onPress={async () => {
            if (recording) {
              const uri = await stopRecording(recording);
              setRecording(null);

              if (uri) {
                try {
                  await uploadRecording(uri);
                  await queryClient.invalidateQueries({
                    queryKey: ["notes"],
                  });
                } catch (err) {
                  console.error("Failed to send request", err);
                }
              }
            } else {
              const newRecording = await startRecording();
              setRecording(newRecording);
            }
          }}
        >
          <View className="flex items-center">
            <View className="rounded-full border border-black p-4">
              {recording ? (
                <SquareIcon className="h-10 w-10 text-black" />
              ) : (
                <MicIcon className="h-10 w-10 text-black" />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/**
 * Index home page
 */
export default function IndexPage() {
  return <Sidebar sidebarComponent={ContentPage} />;
}
