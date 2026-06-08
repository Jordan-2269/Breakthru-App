import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import type { ConversationWithMeta } from '@/types/app';

type Props = {
  conversation: ConversationWithMeta;
  unreadCount: number;
  onPress: () => void;
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function ConversationRow({ conversation, unreadCount, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-row items-center px-4 py-3 bg-surface border-b border-border"
    >
      <Avatar uri={conversation.listing.logo_url} name={conversation.listing.name} size="md" />
      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-sm flex-1 mr-2 ${unreadCount > 0 ? 'font-bold text-text-primary' : 'font-medium text-text-primary'}`}
            numberOfLines={1}
          >
            {conversation.listing.name}
          </Text>
          <Text className="text-xs text-text-tertiary">
            {formatDate(conversation.last_message_at)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between mt-0.5">
          <Text className="text-sm text-text-secondary flex-1 mr-2" numberOfLines={1}>
            {conversation.last_message ?? 'No messages yet'}
          </Text>
          {unreadCount > 0 && (
            <View className="bg-primary rounded-full min-w-5 h-5 items-center justify-center px-1">
              <Text className="text-white text-xs font-bold">{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
