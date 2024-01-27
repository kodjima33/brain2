import { Text, View } from "react-native";
import clsx from "clsx";

interface Props {
  text: string;
  containerClassName?: string;
  textClassName?: string;
}

export default function Badge({ text, containerClassName, textClassName }: Props) {
  return (
    <View className="flex flex-row items-start">
      <View
        className={clsx(
          "rounded-full border px-4 py-2",
          containerClassName,
        )}
      >
        <Text className={clsx(textClassName)}>{text}</Text>
      </View>
    </View>
  );
}
