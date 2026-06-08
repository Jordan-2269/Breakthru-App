import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';

type Props = {
  onSend: (body: string) => void;
  disabled?: boolean;
};

export function MessageInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('');

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  }

  return (
    <View className="flex-row items-end gap-2 px-4 py-3 bg-surface border-t border-border">
      <TextInput
        className="flex-1 border border-border rounded-2xl px-4 py-2.5 text-base text-text-primary bg-background max-h-28"
        placeholder="Write a message..."
        placeholderTextColor="#999"
        value={text}
        onChangeText={setText}
        multiline
        editable={!disabled}
      />
      <TouchableOpacity
        onPress={handleSend}
        disabled={!text.trim() || disabled}
        className={`rounded-full w-10 h-10 items-center justify-center ${
          text.trim() ? 'bg-primary' : 'bg-gray-200'
        }`}
      >
        <Text className={`text-lg ${text.trim() ? 'text-white' : 'text-gray-400'}`}>↑</Text>
      </TouchableOpacity>
    </View>
  );
}
