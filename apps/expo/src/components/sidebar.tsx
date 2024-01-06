import type { DrawerContentComponentProps } from "@react-navigation/drawer/lib/typescript/src/types";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createDrawerNavigator, DrawerItem } from "@react-navigation/drawer";
import { HomePageContent } from "~/screens/home";
import { NotePageContent } from "~/screens/note";

const screens = ["Recent", "Notes", "Digests"];

/**
 * Custom content for the collapsible sidebar
 */
function SidebarContent({ state, navigation }: DrawerContentComponentProps) {
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
 * Collapsible sidebar
 */
export default function Sidebar() {
  return (
    <>
      <Drawer.Navigator
        initialRouteName="Recent"
        drawerContent={(props) => <SidebarContent {...props} />}
      >
        {screens.map((screen) => (
          <Drawer.Screen
            key={screen}
            name={screen}
            component={HomePageContent}
            options={{
              headerShown: false,
            }}
          />
        ))}
        <Drawer.Screen
          name="NotePage"
          component={NotePageContent}
          options={{
            headerShown: false,
          }}
        />
      </Drawer.Navigator>
    </>
  );
}
