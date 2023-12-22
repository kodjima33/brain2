import React from "react";
import { TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { CircleUserRoundIcon, MenuIcon } from "lucide-react-native";

const Index = () => {
  return (
    <SafeAreaView className="bg-white">
      {/* Changes page title visible on the header */}
      <Stack.Screen options={{ title: "Brain²" }} />
      <View className="h-full w-full">
        {/* Header */}
        <View className="flex flex-row items-center justify-between w-full px-4">
          <MenuIcon className="text-black basis-1/12" />
          <TextInput className="basis-8/12 border border-black rounded-full h-10 px-4 py-2" placeholder="Search..." />
          <CircleUserRoundIcon className="text-black basis-1/12" />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Index;
