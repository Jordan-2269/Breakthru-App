import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { View, Text } from 'react-native';
import { useAuth } from '@/lib/auth';
import { useUnreadCount } from '@/hooks/useMessages';

function TabIcon({ focused, emoji, label, badge }: { focused: boolean; emoji: string; label: string; badge?: number }) {
  return (
    <View className="items-center pt-1">
      <View style={{ position: 'relative' }}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
        {!!badge && badge > 0 && (
          <View style={{
            position: 'absolute', top: -3, right: -8,
            backgroundColor: '#E53E3E', borderRadius: 10,
            minWidth: 17, height: 17,
            alignItems: 'center', justifyContent: 'center',
            paddingHorizontal: 3,
          }}>
            <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800' }}>
              {badge > 99 ? '99+' : badge}
            </Text>
          </View>
        )}
      </View>
      <Text
        className={`text-xs mt-0.5 ${focused ? 'text-primary font-semibold' : 'text-text-tertiary'}`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function ParentTabLayout() {
  const { session, role, loading } = useAuth();
  const { data: unreadCount = 0 } = useUnreadCount();

  if (!loading && !session) return <Redirect href="/(auth)/welcome" />;
  if (!loading && role === 'business') return <Redirect href="/(business)/dashboard" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E0DFDB',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} emoji="🔍" label="Search" />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} emoji="🔖" label="Saved" />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} emoji="💬" label="Messages" badge={unreadCount} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} emoji="👤" label="Profile" />
          ),
        }}
      />
      {/* Hide sub-routes from tab bar */}
      <Tabs.Screen name="search/[id]" options={{ href: null }} />
      <Tabs.Screen name="messages/[conversationId]" options={{ href: null }} />
      <Tabs.Screen name="profile/child/new" options={{ href: null }} />
      <Tabs.Screen name="profile/child/[childId]" options={{ href: null }} />
    </Tabs>
  );
}
