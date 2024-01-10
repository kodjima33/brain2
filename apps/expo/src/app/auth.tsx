import { SignedIn, useOAuth, useUser } from "@clerk/clerk-expo";
import Constants from "expo-constants";
import { Redirect, Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Loader2Icon } from "lucide-react-native";
import { useCallback } from "react";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "~/components/button";
import { useWarmupBrowser } from "~/utils/useWarmupBrowser";
import GoogleIcon from "../../assets/google.png";
import Brain2Icon from "../../assets/icon.png";

WebBrowser.maybeCompleteAuthSession();

function SignInButton() {
  useWarmupBrowser();

  const { startOAuthFlow } = useOAuth({
    strategy: "oauth_google",
    redirectUrl: Constants.experienceUrl,
  });

  const onPress = useCallback(async () => {
    try {
      const props = await startOAuthFlow();
      const { createdSessionId, setActive } = props;

      if (createdSessionId) {
        // Mark session as active
        await setActive!({ session: createdSessionId });
      } else {
        console.error("Failed to set active");
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, [startOAuthFlow]);

  return (
    <Button
      text="Sign in with Google"
      onPress={onPress}
      icon={<Image source={GoogleIcon} className="h-6 w-6" />}
    />
  );
}

/**
 * Sign in page shown when the user is not signed in.
 */
export default function AuthPage() {
  const { isLoaded } = useUser();

  return (
    <SafeAreaView className="bg-white">
      <SignedIn>
        <Redirect href="/" />
      </SignedIn>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View className="flex h-full w-full flex-col items-center justify-center gap-8">
        <Image source={Brain2Icon} className="mb-5 h-24 w-24" />
        <View className="flex flex-col items-center gap-2">
          <Text className="text-3xl font-semibold">Meet Your</Text>
          <Text className="text-3xl font-semibold">Brain&sup2;</Text>
        </View>
        {!isLoaded ? (
          <View className="flex w-full items-center justify-center">
            <Loader2Icon size={48} className="animate-spin text-gray-400" />
          </View>
        ) : (
          <SignInButton />
        )}
      </View>
    </SafeAreaView>
  );
}
