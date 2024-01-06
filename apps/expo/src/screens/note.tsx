import type { DrawerNavigationHelpers } from "@react-navigation/drawer/lib/typescript/src/types";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaView, Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";


import { getNoteById } from "~/utils/api";

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