import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { ActivityIndicator, View } from 'react-native';

export default function AuthLayout() {
  const { session, role, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#0A66C2" />
      </View>
    );
  }

  if (session && role === 'parent') return <Redirect href="/(parent)/search" />;
  if (session && role === 'business') return <Redirect href="/(business)/dashboard" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="for-businesses" />
    </Stack>
  );
}
