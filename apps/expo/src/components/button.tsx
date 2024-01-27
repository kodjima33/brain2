import { Pressable, Text } from "react-native";
import clsx from "clsx";

interface Props {
  icon?: JSX.Element;
  text?: string;
  onPress?: () => void;
  enabled?: boolean;
}

/**
 * Custom styled outline button
 */
export default function Button({
  icon,
  text,
  onPress,
  enabled: enabled = true,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={clsx(
        "flex flex-row items-center gap-4 rounded-xl border border-gray-300 px-6 py-3",
        "hover:bg-gray-500 focus:bg-gray-800",
        enabled ? "bg-white" : "bg-gray-200",
      )}
    >
      {icon}
      {text ? <Text className="text-lg">{text}</Text> : null}
    </Pressable>
  );
}
