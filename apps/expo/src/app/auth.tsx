import { SignedIn, SignedOut, useOAuth } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import { useCallback } from "react";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "~/components/button";
import { useWarmupBrowser } from "~/utils/useWarmupBrowser";
import GoogleIcon from "../../assets/google.png";
import Brain2Icon from "../../assets/icon.png";

WebBrowser.maybeCompleteAuthSession();

function SignInScreen() {
  useWarmupBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const onPress = useCallback(async () => {
    try {
      const { createdSessionId, setActive } =
        await startOAuthFlow();

      if (createdSessionId) {
        console.log("Marking as active");
        // Mark session as active
        await setActive!({ session: createdSessionId });
      } else {
        console.error("Error here");
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, []);

  return (
    <View className="flex h-full w-full flex-col items-center justify-center gap-8">
      <View className="flex flex-row items-center gap-2">
        <Image source={Brain2Icon} className="h-8 w-8" />
        <Text className="text-3xl">Brain&sup2;</Text>
      </View>
      {/* <Button title="Sign in with Google" onPress={onPress} /> */}
      <Button
        text="Sign in with Google"
        onPress={onPress}
        icon={<Image source={GoogleIcon} className="h-6 w-6" />}
      />
    </View>
  );
}

/**
 * Page for handling sign in and sign up
 */
export default function AuthPage() {
  return (
    <SafeAreaView>
      <SignedIn>
        <Text>You are Signed in</Text>
      </SignedIn>
      <SignedOut>
        <SignInScreen />
      </SignedOut>
    </SafeAreaView>
  );
}