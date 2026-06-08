import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { View, Text } from 'react-native';
import { useAuth } from '@/lib/auth';

function TabIcon({ focused, emoji, label }: { focused: boolean; emoji: string; label: string }) {
  return (
    <View className="items-center pt-1">
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text className={`text-xs mt-0.5 ${focused ? 'text-primary font-semibold' : 'text-text-tertiary'}`}>
        {label}
      </Text>
    </View>
  );
}

export default function BusinessTabLayout() {
  const { session, role, loading } = useAuth();

  if (!loading && !session) return <Redirect href="/(auth)/welcome" />;
  if (!loading && role === 'parent') return <Redirect href="/(parent)/search" />;

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
        name="dashboard"
        options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="📊" label="Dashboard" /> }}
      />
      <Tabs.Screen
        name="listings"
        options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="🏥" label="Listings" /> }}
      />
      <Tabs.Screen
        name="messages"
        options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="💬" label="Messages" /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="⚙️" label="Account" /> }}
      />
    </Tabs>
  );
}
