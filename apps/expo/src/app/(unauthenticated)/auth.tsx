import { useCallback } from "react";
import { Image, SafeAreaView, Text, View } from "react-native";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useOAuth, useUser } from "@clerk/clerk-expo";
import { Loader2Icon } from "lucide-react-native";

import Button from "~/components/button";
import { useWarmupBrowser } from "~/utils/useWarmupBrowser";
import Brain2Icon from "../../../assets/brain2.png";
import GoogleIcon from "../../../assets/google.png";

WebBrowser.maybeCompleteAuthSession();

function SignInButton() {
  useWarmupBrowser();

  const baseUrl = Constants.experienceUrl ?? "com.brain2.app://";
  const path = baseUrl.startsWith("exp") ? "/--/auth" : "/auth";

  const { startOAuthFlow } = useOAuth({
    strategy: "oauth_google",
    redirectUrl: `${baseUrl}${path}`,
  });

  const onPress = useCallback(async () => {
    try {
      const props = await startOAuthFlow();
      const { createdSessionId, setActive, authSessionResult } = props;

      if (createdSessionId) {
        // Mark session as active
        await setActive!({ session: createdSessionId });
      } else {
        console.error("Failed to set active for reason", authSessionResult?.type);
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
