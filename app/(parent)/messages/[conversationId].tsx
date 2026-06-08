import React, { useRef, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessages, useSendMessage, useConversation, useMarkConversationRead } from '@/hooks/useMessages';
import { useAuth } from '@/lib/auth';
import { Avatar } from '@/components/ui/Avatar';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { MessageInput } from '@/components/messages/MessageInput';

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: conversation } = useConversation(conversationId);
  const { data: messages, isLoading } = useMessages(conversationId);
  const { mutate: sendMessage, isPending } = useSendMessage(conversationId);
  const listRef = useRef<FlatList>(null);
  useMarkConversationRead(conversationId);

  useEffect(() => {
    if (messages && messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages?.length]);

  const businessName = conversation?.listing?.name ?? 'Business';
  const businessLogo = conversation?.listing?.logo_url ?? null;
  const listingId = (conversation as any)?.listing_id ?? null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Text style={{ fontSize: 22, color: '#0A66C2' }}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
          activeOpacity={0.7}
          onPress={() => listingId && router.push(`/(parent)/search/${listingId}`)}
        >
          <Avatar uri={businessLogo} name={businessName} size="sm" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#0A66C2' }} numberOfLines={1}>
              {businessName}
            </Text>
            <Text style={{ fontSize: 12, color: '#888' }}>Tap to view profile →</Text>
          </View>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0A66C2" />
        </View>
      ) : messages && messages.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>👋</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#191919', textAlign: 'center' }}>
            Start the conversation
          </Text>
          <Text style={{ fontSize: 14, color: '#888', textAlign: 'center', marginTop: 6 }}>
            Introduce yourself and ask about services for your child.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} isOwnMessage={item.sender_id === user?.id} />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      <MessageInput onSend={sendMessage} disabled={isPending} />
    </SafeAreaView>
  );
}
