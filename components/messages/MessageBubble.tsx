import React from 'react';
import { View, Text } from 'react-native';
import type { Message } from '@/types/app';

type Props = {
  message: Message;
  isOwnMessage: boolean;
};

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message, isOwnMessage }: Props) {
  return (
    <View className={`mb-2 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
      <View
        className={`max-w-xs rounded-2xl px-4 py-2.5 ${
          isOwnMessage ? 'bg-primary rounded-tr-sm' : 'bg-gray-100 rounded-tl-sm'
        }`}
      >
        <Text className={`text-sm ${isOwnMessage ? 'text-white' : 'text-text-primary'}`}>
          {message.body}
        </Text>
      </View>
      <Text className="text-xs text-text-tertiary mt-0.5 px-1">
        {formatTime(message.created_at)}
      </Text>
    </View>
  );
}
