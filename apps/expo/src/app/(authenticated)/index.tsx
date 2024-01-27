import type { Recording } from "expo-av/build/Audio";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import {
  RefreshControl,
  Swipeable,
  TouchableOpacity,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2Icon,
  MicIcon,
  RefreshCwIcon,
  SquareIcon,
} from "lucide-react-native";
import { DateTime } from "luxon";

import type { Note, NoteDigestSpan } from "@brain2/db/client";

import Avatar from "~/components/avatar";
import Badge from "~/components/badge";
import Button from "~/components/button";
import { NoteCard, NoteListItemRightSwipeActions } from "~/components/note";
import { deleteNoteById, getNotes, uploadRecording } from "~/utils/api";
import { startRecording, stopRecording } from "~/utils/audio";

/**
 * Home page for authenticated users
 */
export default function HomePage() {
  const queryClient = useQueryClient();
  const { isLoaded: isUserLoaded, isSignedIn, getToken, userId } = useAuth();

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
    enabled: isUserLoaded && isSignedIn,
  });

  if (notesError) {
    console.error("[getNotes] Query error:", notesError);
  }

  const { mutate: uploadRecordingMutation } = useMutation({
    mutationFn: async (audioUrl: string) => {
      return uploadRecording(audioUrl, (await getToken())!);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });

      const date = DateTime.now().toJSDate();
      const staleNotes: Note[] = queryClient.getQueryData(["notes"])!;
      const dummyNote: Note = {
        id: "note_optimistic_placeholder",
        owner: userId!,
        title: "New Recording (Processing...)",
        content: "New Recording (Processing...)",
        digestSpan: "SINGLE",
        childrenIds: [],
        parentIds: [],
        active: false,
        digestStartDate: date,
        createdAt: date,
        updatedAt: date,
      };

      queryClient.setQueryData(["notes"], [dummyNote, ...staleNotes]);
      return { staleNotes };
    },
    onError: (err, _noteId, context) => {
      console.error(err);
      queryClient.setQueryData(["notes"], context?.staleNotes);
    },
    onSuccess: async () => {
      // Refetch data
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

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
    onError: (err, _noteId, context) => {
      console.error(err);
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

  const [selectedSpan, setSelectedSpan] = useState<NoteDigestSpan>("SINGLE");
  const filteredNotes = useMemo(() => {
    return notes?.filter((note) => note.digestSpan === selectedSpan);
  }, [notes, selectedSpan]);

  return (
    <SafeAreaView className="bg-white pt-10">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      {/* Changes page title visible on the header */}
      <View className="flex h-full w-full flex-col justify-between pb-5">
        {/* Header */}
        <View className="flex w-full flex-row items-center justify-between gap-4 px-4">
          <TextInput
            className="h-10 flex-grow rounded-full border border-black px-4 py-2"
            placeholder="Search..."
          />
          <Avatar />
        </View>
        {/* Badges */}
        <View className="flex w-full flex-row items-center justify-start gap-2 p-4">
          <Pressable onPress={() => setSelectedSpan("SINGLE")}>
            <Badge
              text="Notes"
              containerClassName={
                selectedSpan === "SINGLE"
                  ? "border-black bg-[#BAE6FD]"
                  : "border-gray-500 bg-gray-100"
              }
              textClassName={
                selectedSpan === "SINGLE" ? "color-black" : "color-gray-500"
              }
            />
          </Pressable>
          <Pressable onPress={() => setSelectedSpan("DAY")}>
            <Badge
              text="Dailies"
              containerClassName={
                selectedSpan === "DAY"
                  ? "border-black bg-[#BAE6FD]"
                  : "border-gray-500 bg-gray-100"
              }
              textClassName={
                selectedSpan === "DAY" ? "color-black" : "color-gray-500"
              }
            />
          </Pressable>
          <Pressable onPress={() => setSelectedSpan("WEEK")}>
            <Badge
              text="Weeklies"
              containerClassName={
                selectedSpan === "WEEK"
                  ? "border-black bg-[#BAE6FD]"
                  : "border-gray-500 bg-gray-100"
              }
              textClassName={
                selectedSpan === "WEEK" ? "color-black" : "color-gray-500"
              }
            />
          </Pressable>
        </View>
        {/* Content */}
        <View className="flex max-h-[80vh] flex-grow flex-col items-start justify-start gap-2">
          {notesLoading && (
            <View className="flex h-[50vh] w-full items-center justify-center">
              <Loader2Icon size={48} className="animate-spin text-gray-400" />
            </View>
          )}
          {!notesLoading && filteredNotes?.length === 0 && (
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
          <View className="relative flex flex-[1] flex-col mt-[-2em]">
            <FlatList
              data={filteredNotes}
              keyExtractor={(note) => note.id}
              renderItem={({ item: note }) => {
                if (note.active) {
                  // Using Pressable because for some reason, Link screws up the cell layout
                  return (
                    <Pressable
                      onPress={() => router.push(`/note/${note.id}`)}
                      key={note.id}
                    >
                      <Swipeable
                        renderRightActions={NoteListItemRightSwipeActions}
                        onSwipeableOpen={() => deleteNote(note.id)}
                      >
                        <NoteCard note={note} />
                      </Swipeable>
                    </Pressable>
                  );
                } else {
                  // Disable interaction if note is not active (placeholder from optimistic updates)
                  return <NoteCard note={note} key={note.id} />;
                }
              }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing || notesLoading}
                  onRefresh={onRefresh}
                />
              }
            />

            {/* Blur masks */}
            {/* <LinearGradient
              colors={["#FFFFFF", "transparent"]}
              className="absolute left-0 right-0 top-0 h-[10vh]"
            /> */}
            <LinearGradient
              colors={["transparent", "#FFFFFF"]}
              className="absolute bottom-0 left-0 right-0 h-[10vh]"
            />
          </View>
        </View>
        {/* FAB */}
        <TouchableOpacity
          onPress={async () => {
            if (recording) {
              const uri = await stopRecording(recording);
              setRecording(null);

              if (uri) {
                uploadRecordingMutation(uri);
              }
            } else {
              const newRecording = await startRecording();
              setRecording(newRecording);
            }
          }}
        >
          <View className="mt-[-5em] flex items-center">
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
