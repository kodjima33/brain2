import React, { useEffect, useState } from "react";
import { Text, TextInput } from "react-native";

interface TextComponentProps {
  className?: string;
  children?: React.ReactNode;
}

interface Props {
  editable: boolean;
  text?: string;
  setText?: (text: string) => void;
  onSave?: (text: string) => void;
  className?: string;
  TextComponent?: React.ComponentType<TextComponentProps>;
}

export function EditableText({
  editable,
  text,
  onSave,
  className,
  TextComponent,
}: Props) {
  const [value, setValue] = useState(text ?? "");
  useEffect(() => {
    if (!editable && value != text) {
      // Save changes
      onSave?.(value);
    }
  }, [editable, onSave, value, text]);

  useEffect(() => {
    setValue(text ?? "");
  }, [text])

  return editable ? (
    <TextInput
      className={className}
      multiline={true}
      value={value}
      onChangeText={setValue}
      autoCorrect={false}
      cursorColor={"#000"}
    />
  ) : TextComponent ? (
    <TextComponent className={className ?? ""}>{value}</TextComponent>
  ) : (
    <Text className={className}>{value}</Text>
  );
}
