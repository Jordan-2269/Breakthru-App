import React, { useRef, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessages, useSendMessage } from '@/hooks/useMessages';
import { useAuth } from '@/lib/auth';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { MessageInput } from '@/components/messages/MessageInput';

export default function BusinessChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: messages, isLoading } = useMessages(conversationId);
  const { mutate: sendMessage, isPending } = useSendMessage(conversationId);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages && messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages?.length]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-row items-center px-4 py-3 bg-surface border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-primary">←</Text>
        </TouchableOpacity>
        <Text className="text-base font-semibold text-text-primary flex-1">Conversation</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0A66C2" />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} isOwnMessage={item.sender_id === user?.id} />
          )}
          contentContainerStyle={{ padding: 16 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      <MessageInput onSend={sendMessage} disabled={isPending} />
    </SafeAreaView>
  );
}
