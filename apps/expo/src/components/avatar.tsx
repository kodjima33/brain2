import { Image, Pressable } from "react-native";
import { router } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { UserIcon } from "lucide-react-native";

/**
 * A clickable avatar icon that redirects to the settings page
 */
export default function Avatar() {
  const { user } = useUser();

  return (
    <Pressable
      onPress={() => {
        router.push("/settings");
      }}
    >
      {user?.imageUrl ? (
        <Image
          source={{
            uri: user.imageUrl,
          }}
          alt="Profile"
          className="h-10 w-10 rounded-full border border-gray-300"
        />
      ) : (
        <UserIcon className="h-10 w-10 text-black" />
      )}
    </Pressable>
  );
}
