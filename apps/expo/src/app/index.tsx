import type { DrawerNavigationHelpers } from "@react-navigation/drawer/lib/typescript/src/types";
import React from "react";
import { Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { CircleUserRoundIcon, MenuIcon } from "lucide-react-native";

const Drawer = createDrawerNavigator();

interface DrawerPageProps {
  navigation: DrawerNavigationHelpers;
}

function createDrawerPage(title: string) {
  return function DrawerPage({ navigation }: DrawerPageProps) {
    return (
      <SafeAreaView className="bg-white">
        {/* Changes page title visible on the header */}
        <View className="h-full w-full">
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
          {/* Insert page contents */}
          <Text>{title}</Text>
        </View>
      </SafeAreaView>
    );
  };
}

// Pre-create the pages
const Recent = createDrawerPage("Recent");
const Notes = createDrawerPage("Notes");
const Digests = createDrawerPage("Digests");

/**
 * Index home page
 */
export default function IndexPage() {
  return (
    <>
      <Stack.Screen options={{ title: "Brain²" }} />
      <Drawer.Navigator initialRouteName="Recent">
        <Drawer.Screen
          name="Recent"
          component={Recent}
          options={{
            headerShown: false,
          }}
        />
        <Drawer.Screen
          name="Notes"
          component={Notes}
          options={{
            headerShown: false,
          }}
        />
        <Drawer.Screen
          name="Digests"
          component={Digests}
          options={{
            headerShown: false,
          }}
        />
      </Drawer.Navigator>
    </>
  );
}
