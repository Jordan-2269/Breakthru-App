import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';
import { useChildProfiles, useChildNeeds } from '@/hooks/useChildProfiles';
import { useChildStore } from '@/store/childStore';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ChildProfileCard } from '@/components/profile/ChildProfileCard';
import { Button } from '@/components/ui/Button';
import { SectionTitle } from '@/components/layout/SectionTitle';

export default function ParentProfileScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const { data: children } = useChildProfiles();
  const activeChild = useChildStore((s) => s.activeChild);

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader
          name={profile?.display_name ?? 'My Profile'}
          subtitle="Parent / Guardian"
          avatarUri={profile?.avatar_url}
        />

        <View className="px-4 py-4">
          {/* Children section */}
          <View className="mb-6">
            <SectionTitle
              title="Child Profiles"
              subtitle="Tap 'Set Active' to match services to your child's needs"
              action={
                <TouchableOpacity onPress={() => router.push('/(parent)/profile/child/new')}>
                  <Text className="text-primary text-sm font-medium">+ Add Child</Text>
                </TouchableOpacity>
              }
            />
            {!children || children.length === 0 ? (
              <View className="bg-surface border border-border rounded-xl p-6 items-center">
                <Text className="text-2xl mb-2">👶</Text>
                <Text className="text-sm font-semibold text-text-primary">No child profiles yet</Text>
                <Text className="text-xs text-text-secondary text-center mt-1">
                  Add your child's profile to get personalized service recommendations.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/(parent)/profile/child/new')}
                  className="mt-3"
                >
                  <Text className="text-primary text-sm font-medium">Create profile →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              children.map((child) => (
                <ChildProfileCard
                  key={child.id}
                  child={child}
                  isActive={activeChild?.id === child.id}
                />
              ))
            )}
          </View>

          <Button
            label="Sign Out"
            onPress={handleSignOut}
            variant="outlined"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
