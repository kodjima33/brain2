import { useCallback } from "react";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { Link, router, useNavigation } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  SignedIn,
  SignedOut,
  useAuth,
  useOAuth,
  useUser,
} from "@clerk/clerk-expo";
import { Loader2Icon } from "lucide-react-native";

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

function SignOutButton() {
  const { signOut } = useAuth();

  const onPress = useCallback(async () => {
    await signOut();
  }, [signOut]);

  return <Button text="Sign out" onPress={onPress} />;
}

/**
 * Page for handling sign in and sign up
 */
export default function AuthPage() {
  const { isLoaded, user } = useUser();

  const message = user?.firstName
    ? `Welcome, ${user.firstName}!`
    : "Welcome back!";

  return (
    <SafeAreaView>
      <View className="flex h-full w-full flex-col items-center justify-center gap-4">
        <View className="flex flex-row items-center gap-2">
          <Image source={Brain2Icon} className="h-8 w-8" />
          <Text className="text-3xl">Brain&sup2;</Text>
        </View>
        {!isLoaded ? (
          <View className="flex w-full items-center justify-center">
            <Loader2Icon size={48} className="animate-spin text-gray-400" />
          </View>
        ) : (
          <>
            <SignedIn>
              <View className="flex flex-col items-center gap-8">
                <Text className="text-2xl">{message}</Text>
                <View className="flex flex-col items-center gap-2">
                  <Button
                    text="Home"
                    onPress={() => {
                      router.push("/");
                    }}
                  />
                  <SignOutButton />
                </View>
              </View>
            </SignedIn>
            <SignedOut>
              <SignInButton />
            </SignedOut>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
