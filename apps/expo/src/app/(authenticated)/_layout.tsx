import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";
import { SearchIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";

import Avatar from "~/components/avatar";

/**
 * Redirects to /auth if the user is not signed in.
 */
export default function AuthenticatedLayout() {
  return (
    <>
      <SignedOut>
        <Redirect href="/auth" />
      </SignedOut>
      <SignedIn>
        <Stack
          screenOptions={{
            headerShadowVisible: false,
            headerTitle: "",
            headerRight: () => {
              return (
                <View className="flex flex-row items-center gap-5">
                  <Pressable>
                    <SearchIcon className="h-10 w-10 text-black" />
                  </Pressable>
                  <Avatar />
                </View>
              );
            },
          }}
        />
      </SignedIn>
    </>
  );
}
