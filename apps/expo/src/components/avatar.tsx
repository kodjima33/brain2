import { Image, View } from "react-native";
import { Link } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { UserIcon } from "lucide-react-native";

/**
 * A clickable avatar icon that redirects to the settings page
 */
export default function Avatar() {
  const { user } = useUser();

  return (
    <Link href="/settings">
      <View className="rounded-full border border-gray-500">
        {user?.imageUrl ? (
          <Image
            source={{
              uri: user.imageUrl,
            }}
            alt="Profile"
            className="h-10 w-10 rounded-full"
          />
        ) : (
          <UserIcon className="h-10 w-10 text-black" />
        )}
      </View>
    </Link>
  );
}
