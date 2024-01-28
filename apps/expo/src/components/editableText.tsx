import React, { useEffect, useState } from "react";
import { Text, TextInput } from "react-native";

interface TextComponentProps {
  className?: string;
  children?: React.ReactNode;
}

interface Props {
  editable: boolean;
  text?: string;
  onChange?: (text: string) => void;
  className?: string;
  TextComponent?: React.ComponentType<TextComponentProps>;
}

export function EditableText({
  editable,
  text,
  onChange,
  className,
  TextComponent,
}: Props) {
  const [value, setValue] = useState(text ?? "");

  useEffect(() => {
    if (!editable) {
      // Save changes
      onChange?.(value);
    }
  }, [editable, onChange, value]);

  return editable ? (
    <TextInput
      className={className}
      multiline={true}
      value={value}
      onChangeText={setValue}
      autoCorrect={false}
      onEndEditing={() => onChange?.(value)}
    />
  ) : TextComponent ? (
    <TextComponent className={className ?? ""}>{value}</TextComponent>
  ) : (
    <Text className={className}>{value}</Text>
  );
}
