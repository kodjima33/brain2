import { Text, View } from "react-native";
import clsx from "clsx";

interface Props {
  text: string;
  className?: string;
}

export default function Badge({ text, className }: Props) {
  return (
    <View className="flex flex-row items-start">
      <View
        className={clsx(
          "rounded-full border border-black bg-gray-200 px-4 py-2",
          className,
        )}
      >
        <Text>{text}</Text>
      </View>
    </View>
  );
}
