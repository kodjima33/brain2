import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Stack } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import clsx from "clsx";
import { LogOutIcon } from "lucide-react-native";

interface SettingEntryProps {
  icon: JSX.Element;
  text: string;
  onPress: () => void;
  textClassName?: string;
}

/**
 * A clickable entry in the settings page.
 */
function SettingEntry({
  icon,
  text,
  onPress,
  textClassName,
}: SettingEntryProps) {
  return (
    <Pressable onPress={onPress}>
      <View className="flex flex-row gap-4">
        {icon}
        <Text className={clsx("text-lg", textClassName)}>{text}</Text>
      </View>
    </Pressable>
  );
}

export default function SettingsPage() {
  const { signOut } = useAuth();
  const { user } = useUser();

  if (user == null) {
    // This should never happen
    router.push("/auth");
    return null;
  }

  return (
    <SafeAreaView className="bg-white">
      <Stack.Screen
        options={{
          headerTitle: "Settings",
        }}
      />
      <View className="flex h-full w-full flex-col gap-4 p-4">
        {/* Avatar */}
        <View className="flex flex-row gap-5">
          <Image
            source={{
              uri: user.imageUrl,
            }}
            alt="Profile"
            height={48}
            width={48}
            className="rounded-full border border-gray-300"
          />
          <View className="flex flex-col">
            <Text className="text-2xl font-semibold">{user.fullName}</Text>
            <Text className="font-light">
              {user.primaryEmailAddress?.emailAddress}
            </Text>
          </View>
        </View>

        {/* Account */}
        <Text className="text-xl font-semibold">Account</Text>
        <SettingEntry
          icon={<LogOutIcon className="text-red-500" />}
          text="Sign out"
          textClassName="text-red-500"
          onPress={async () => {
            await signOut();
            router.push("/auth");
          }}
        />
      </View>
    </SafeAreaView>
  );
}
