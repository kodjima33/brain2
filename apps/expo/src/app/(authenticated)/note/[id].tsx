import { useCallback, useEffect, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import Markdown from "react-native-markdown-display";
import { Stack, useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, PencilIcon, SaveIcon } from "lucide-react-native";
import { DateTime } from "luxon";

import type { Note } from "@brain2/db/client";

import Avatar from "~/components/avatar";
import { EditableText } from "~/components/editableText";
import { getNoteById, updateNote } from "~/utils/api";

interface NoteUpdateParams {
  title: string;
  content: string;
}

interface NoteViewProps {
  note: Note;
  loading: boolean;
  editMode: boolean;
  refetch: () => Promise<unknown>;
  updateNote: ({ title, content }: NoteUpdateParams) => unknown;
}

function NoteView({
  note,
  loading,
  refetch,
  editMode,
  updateNote,
}: NoteViewProps) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const date = DateTime.fromISO(note.digestStartDate.toString());
  const dateString = date.toFormat("cccc, LLL dd");
  const timeString = date.toFormat("hh:mm a");

  const [edited, setEdited] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  useEffect(() => {
    const changeDetected = note.title != title || note.content != content;
    if (!editMode && edited && changeDetected) {
      // Save changes
      updateNote({ title, content });
      setEdited(false);
    } else if (editMode) {
      // Mark that we entered edit mode
      setEdited(true);
    }
  }, [title, content, note, updateNote, editMode, setEdited, edited]);

  return (
    <View className="mb-12 flex flex-col gap-2">
      <EditableText
        editable={editMode}
        text={note.title}
        className="text-3xl"
        onSave={async (newTitle) => {
          setTitle(newTitle);
        }}
      />
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
        <EditableText
          editable={editMode}
          text={note.content}
          TextComponent={Markdown}
          onSave={async (newContent) => {
            setContent(newContent);
          }}
        />
      </ScrollView>
    </View>
  );
}

export default function NotePage() {
  const { id } = useLocalSearchParams();
  const { isLoaded: isUserLoaded, getToken } = useAuth();
  const queryClient = useQueryClient();

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

  const { mutate: updateNoteMutation } = useMutation({
    mutationFn: async ({ title, content }: NoteUpdateParams) => {
      return updateNote(id as string, title, content, (await getToken())!);
    },
    onError: (err, _noteId) => {
      console.error(err);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [id, "notes"],
        refetchType: "all",
      });
    },
  });

  if (noteError) {
    console.error(noteError);
  }

  const [editMode, setEditMode] = useState(false);

  return (
    <SafeAreaView className="bg-white">
      <Stack.Screen
        options={{
          headerRight: () => {
            return (
              <View className="flex flex-row items-center gap-5">
                <Pressable onPress={() => setEditMode(!editMode)}>
                  {editMode ? (
                    <SaveIcon className="h-10 w-10 text-black" />
                  ) : (
                    <PencilIcon className="h-10 w-10 text-black" />
                  )}
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
            <NoteView
              note={note}
              loading={noteLoading}
              refetch={refetch}
              editMode={editMode}
              updateNote={updateNoteMutation}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
