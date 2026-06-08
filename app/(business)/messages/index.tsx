import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useConversations } from '@/hooks/useMessages';
import { useAuth } from '@/lib/auth';
import { ConversationRow } from '@/components/messages/ConversationRow';

export default function BusinessMessagesScreen() {
  const router = useRouter();
  const { role } = useAuth();
  const { data: conversations, isLoading } = useConversations();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-4 pt-2 pb-3 bg-surface border-b border-border">
        <Text className="text-xl font-bold text-text-primary">Messages</Text>
        <Text className="text-sm text-text-secondary">Incoming inquiries from families</Text>
      </View>

      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0A66C2" />
        </View>
      )}

      {!isLoading && (!conversations || conversations.length === 0) && (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-3xl mb-3">💬</Text>
          <Text className="text-base font-semibold text-text-primary text-center">No messages yet</Text>
          <Text className="text-sm text-text-secondary text-center mt-2">
            When families message your listings, they'll appear here.
          </Text>
        </View>
      )}

      {conversations && conversations.length > 0 && (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationRow
              conversation={item}
              unreadCount={item.business_unread_count}
              onPress={() => router.push(`/(business)/messages/${item.id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
