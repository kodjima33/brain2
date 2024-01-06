import { Pressable, Text } from "react-native";
import clsx from "clsx";

interface Props {
  icon?: JSX.Element;
  text: string;
  onPress: () => void;
}

/**
 * Custom styled outline button
 */
export default function Button({ icon, text, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={clsx(
        "flex flex-row items-center gap-4 rounded-xl border border-gray-300 px-6 py-3",
        "bg-white hover:bg-gray-500 focus:bg-gray-800",
      )}
    >
      {icon}
      <Text className="text-lg">{text}</Text>
    </Pressable>
  );
}