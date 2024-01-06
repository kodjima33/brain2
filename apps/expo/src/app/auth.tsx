import { useCallback } from "react";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { SignedIn, SignedOut, useAuth, useOAuth } from "@clerk/clerk-expo";

import Button from "~/components/button";
import { useWarmupBrowser } from "~/utils/useWarmupBrowser";
import GoogleIcon from "../../assets/google.png";
import Brain2Icon from "../../assets/icon.png";

WebBrowser.maybeCompleteAuthSession();

/**
 * Screen to sign in
 */
function SignInScreen() {
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
  }, []);

  return (
    <View className="flex h-full w-full flex-col items-center justify-center gap-8">
      <View className="flex flex-row items-center gap-2">
        <Image source={Brain2Icon} className="h-8 w-8" />
        <Text className="text-3xl">Brain&sup2;</Text>
      </View>
      <Button
        text="Sign in with Google"
        onPress={onPress}
        icon={<Image source={GoogleIcon} className="h-6 w-6" />}
      />
    </View>
  );
}

/**
 * Sign out screen
 */
function SignOutScreen() {
  const { signOut } = useAuth();

  const onPress = useCallback(async () => {
    await signOut();
  }, []);

  return (
    <View className="flex h-full w-full flex-col items-center justify-center gap-8">
      <View className="flex flex-row items-center gap-2">
        <Image source={Brain2Icon} className="h-8 w-8" />
        <Text className="text-3xl">Brain&sup2;</Text>
      </View>
      <Button text="Sign out" onPress={onPress} />
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
        <SignOutScreen />
      </SignedIn>
      <SignedOut>
        <SignInScreen />
      </SignedOut>
    </SafeAreaView>
  );
}
