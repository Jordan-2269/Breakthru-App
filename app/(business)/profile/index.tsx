import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function BusinessProfileScreen() {
  const { profile, signOut } = useAuth();

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView>
        <ProfileHeader
          name={profile?.display_name ?? 'My Business'}
          subtitle="Service Provider"
          avatarUri={profile?.avatar_url}
        />
        <View className="px-4 py-4 gap-4">
          <Card>
            <Text className="text-sm font-semibold text-text-primary mb-1">Account Email</Text>
            <Text className="text-sm text-text-secondary">Managed through authentication settings</Text>
          </Card>
          <Card>
            <Text className="text-sm font-semibold text-text-primary mb-1">Phone</Text>
            <Text className="text-sm text-text-secondary">{profile?.phone ?? 'Not set'}</Text>
          </Card>
          <Button label="Sign Out" onPress={handleSignOut} variant="outlined" fullWidth />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
