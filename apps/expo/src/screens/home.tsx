import { useAuth, useUser } from "@clerk/clerk-expo";
import type { DrawerNavigationHelpers } from "@react-navigation/drawer/lib/typescript/src/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Recording } from "expo-av/build/Audio";
import { router } from "expo-router";
import {
  Loader2Icon,
  MenuIcon,
  MicIcon,
  RefreshCwIcon,
  SquareIcon,
  UserIcon
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  RefreshControl,
  Swipeable,
  TouchableOpacity,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Note } from "@brain2/db/client";

import Button from "~/components/button";
import { NoteListItem, NoteListItemRightSwipeActions } from "~/components/note";
import { deleteNoteById, getNotes, uploadRecording } from "~/utils/api";
import { startRecording, stopRecording } from "~/utils/audio";

interface ContentPageProps {
  navigation: DrawerNavigationHelpers;
}

export function HomePageContent({ navigation }: ContentPageProps) {
  const queryClient = useQueryClient();
  const { isLoaded: isUserLoaded, getToken } = useAuth();
  const { user } = useUser();

  const {
    data: notes,
    error: notesError,
    isLoading: notesLoading,
    refetch: refetchNotes,
  } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      return getNotes((await getToken())!);
    },
    enabled: isUserLoaded,
  });

  if (notesError) {
    console.error("[getNotes] Query error:", notesError);
  }

  const { mutate: deleteNote } = useMutation({
    mutationFn: async (noteId: string) => {
      return deleteNoteById(noteId, (await getToken())!);
    },
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });

      const staleNotes: Note[] = queryClient.getQueryData(["notes"])!;
      queryClient.setQueryData(
        ["notes"],
        staleNotes.filter((note) => note.id !== noteId),
      );

      return { staleNotes };
    },
    onError: (_err, _noteId, context) => {
      queryClient.setQueryData(["notes"], context?.staleNotes);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const [recording, setRecording] = useState<Recording | null>();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchNotes();
    setRefreshing(false);
  }, [refetchNotes]);

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
          <Pressable
            onPress={() => {
              router.push("/auth");
            }}
          >
            {user?.imageUrl ? (
              <Image
                source={{
                  uri: user.imageUrl,
                }}
                alt="Profile"
                className="h-10 w-10 rounded-full border border-gray-300"
              />
            ) : (
              <UserIcon className="basis-1/12 text-black" />
            )}
          </Pressable>
        </View>
        {/* Content */}
        <View className="flex max-h-[80vh] flex-grow flex-col items-start justify-start gap-2">
          {notesLoading && (
            <View className="flex h-[50vh] w-full items-center justify-center">
              <Loader2Icon size={48} className="animate-spin text-gray-400" />
            </View>
          )}
          {!notesLoading && notes?.length === 0 && (
            <View className="flex h-[50vh] w-full items-center justify-center gap-5">
              <Text className="text-xl font-semibold text-gray-500">
                Nothing here yet!
              </Text>
              <Button
                icon={
                  refreshing ? (
                    <Loader2Icon className="animate-spin text-gray-500" />
                  ) : (
                    <RefreshCwIcon className="text-gray-500" />
                  )
                }
                onPress={onRefresh}
                enabled={!refreshing}
              />
            </View>
          )}
          <FlatList
            data={notes}
            keyExtractor={(note) => note.id}
            renderItem={({ item: note }) => (
              <Pressable
                onPress={() => {
                  navigation.navigate("NotePage", { id: note.id });
                }}
              >
                <Swipeable
                  renderRightActions={NoteListItemRightSwipeActions}
                  onSwipeableOpen={() => deleteNote(note.id)}
                >
                  <NoteListItem note={note} />
                </Swipeable>
              </Pressable>
            )}
            ItemSeparatorComponent={() => (
              <View className="h-[1px] bg-gray-400" />
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing || notesLoading}
                onRefresh={onRefresh}
              />
            }
          />
        </View>
        {/* FAB */}
        <TouchableOpacity
          onPress={async () => {
            if (recording) {
              const uri = await stopRecording(recording);
              setRecording(null);

              if (uri) {
                try {
                  const token = await getToken();
                  await uploadRecording(uri, token!);
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
