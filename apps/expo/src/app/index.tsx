import type {
  DrawerContentComponentProps,
  DrawerNavigationHelpers,
} from "@react-navigation/drawer/lib/typescript/src/types";
import React from "react";
import { Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { createDrawerNavigator, DrawerItem } from "@react-navigation/drawer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleUserRoundIcon, MenuIcon, MicIcon } from "lucide-react-native";

import type { Note } from "@brain2/db/client";

import { createNote, getNotes } from "~/utils/api";

interface NoteEntryProps {
  note: Note;
}
function NoteEntry({ note }: NoteEntryProps) {
  return (
    <View className="flex flex-col gap-2">
      <Text className="text-xl">{note.createdAt.toString()}</Text>
    </View>
  );
}

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
        <View className="flex flex-col flex-grow items-start justify-start gap-2">
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

const screens = ["Recent", "Notes", "Digests"];

/**
 * Collapsible sidebar
 */
function Sidebar({ state, navigation }: DrawerContentComponentProps) {
  return (
    <SafeAreaView>
      <View className="flex flex-col justify-center gap-5 pt-10">
        <Text className="text-center text-4xl">Brain²</Text>
        <View className="mx-6 border border-gray-400" />
        <View>
          {screens.map((screen, index) => (
            <DrawerItem
              key={index}
              focused={state.index === index}
              label={screen}
              onPress={() => {
                navigation.navigate(screen);
              }}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const Drawer = createDrawerNavigator();

/**
 * Index home page
 */
export default function IndexPage() {
  return (
    <>
      <Drawer.Navigator
        initialRouteName="Recent"
        drawerContent={(props) => <Sidebar {...props} />}
      >
        <Drawer.Screen
          name="Recent"
          component={ContentPage}
          options={{
            headerShown: false,
          }}
        />
        <Drawer.Screen
          name="Notes"
          component={ContentPage}
          options={{
            headerShown: false,
          }}
        />
        <Drawer.Screen
          name="Digests"
          component={ContentPage}
          options={{
            headerShown: false,
          }}
        />
      </Drawer.Navigator>
    </>
  );
}
