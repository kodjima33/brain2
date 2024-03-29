import type { Recording } from "expo-av/build/Audio";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import {
  RefreshControl,
  Swipeable,
  TouchableOpacity,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
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

import type { PopulatedNote } from "~/components/note";
import Badge from "~/components/badge";
import Button from "~/components/button";
import { NoteCard, NoteListItemRightSwipeActions } from "~/components/note";
import { deleteNoteById, getNotes, uploadRecording } from "~/utils/api";
import { startRecording, stopRecording } from "~/utils/audio";
import Brain2Icon from "../../../assets/brain2.png";

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
      const staleNotes: PopulatedNote[] = queryClient.getQueryData(["notes"])!;
      const dummyNote: PopulatedNote = {
        id: "note-id",
        owner: userId!,
        digestSpan: "SINGLE",
        revisionId: "note-revision-id",
        revision: {
          id: "note-revision-id",
          noteId: "note-id",
          title: "New Recording (Processing...)",
          content: "New Recording (Processing...)",
          createdAt: date,
          updatedAt: date,
        },
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
    <SafeAreaView className="bg-white">
      <Stack.Screen
        options={{
          headerLeft: () => {
            return <Image source={Brain2Icon} className="h-10 w-10" />;
          },
        }}
      />
      <View className="flex h-full w-full flex-col items-center justify-between pb-5">
        {/* Badges */}
        <View className="flex w-full flex-row items-center justify-start gap-2 px-4">
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
        <View className="flex max-h-[70vh] flex-grow flex-col items-start justify-start gap-2">
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
          <FlatList
            data={filteredNotes}
            keyExtractor={(note) => note.id}
            fadingEdgeLength={100}
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
