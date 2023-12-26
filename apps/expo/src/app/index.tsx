import type { DrawerNavigationHelpers } from "@react-navigation/drawer/lib/typescript/src/types";
import React from "react";
import { TextInput, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleUserRoundIcon, MenuIcon, MicIcon } from "lucide-react-native";

import Sidebar from "~/components/sidebar";
import { createNote, getNotes } from "~/utils/api";
import NoteEntry from "~/components/note-entry";

interface ContentPageProps {
  navigation: DrawerNavigationHelpers;
}

function ContentPage({ navigation }: ContentPageProps) {
  const queryClient = useQueryClient();

  const { data: notes, error: queryError } = useQuery({
    queryKey: ["notes"],
    queryFn: getNotes,
  });

  if (queryError) {
    console.error("[getNotes] Query error:", queryError);
  }

  const { mutate } = useMutation({
    mutationFn: createNote,
    onSuccess() {
      void queryClient.invalidateQueries({
        queryKey: ["notes"],
      });
    },
  });

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
        <View className="flex flex-grow flex-col items-start justify-start gap-2 overflow-y-auto">
          {notes?.map((note) => <NoteEntry key={note.id} note={note} />)}
        </View>
        {/* FAB */}
        <TouchableOpacity
          onPress={async () => {
            console.log("Creating note");
            mutate("Hello world");
          }}
        >
          <View className="flex items-center">
            <View className="rounded-full border border-black p-4">
              <MicIcon className="h-10 w-10 text-black" />
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
