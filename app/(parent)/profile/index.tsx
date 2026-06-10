import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';
import { useChildProfiles } from '@/hooks/useChildProfiles';
import { useChildStore } from '@/store/childStore';
import { useUpdateAvatar } from '@/hooks/useUpdateAvatar';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ChildProfileCard } from '@/components/profile/ChildProfileCard';
import { SectionTitle } from '@/components/layout/SectionTitle';
import { supabase } from '@/lib/supabase';

export default function ParentProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { data: children } = useChildProfiles();
  const activeChild = useChildStore((s) => s.activeChild);
  const { pickAndUpload, isUploading } = useUpdateAvatar();

  async function handleSignOut() {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) {
        await signOut();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]);
    }
  }

  async function handleDeleteAccount() {
    const confirmed = Platform.OS === 'web'
      ? window.confirm('Delete your account permanently?\n\nThis will remove your profile, all child profiles, and all saved data. This cannot be undone.')
      : await new Promise<boolean>((resolve) =>
          Alert.alert(
            'Delete Account',
            'This will permanently delete your account, all child profiles, and all saved data. This cannot be undone.',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
            ],
          ),
        );
    if (!confirmed) return;

    const { error } = await supabase.rpc('delete_own_account');
    if (error) {
      if (Platform.OS === 'web') {
        window.alert(`Error: ${error.message}`);
      } else {
        Alert.alert('Error', error.message);
      }
      return;
    }
    await signOut();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F2EE' }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader
          name={profile?.display_name ?? 'My Profile'}
          subtitle="Parent / Guardian"
          avatarUri={profile?.avatar_url}
          onAvatarPress={pickAndUpload}
          avatarUploading={isUploading}
        />

        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {/* Child Profiles section */}
          <SectionTitle
            title="Child Profiles"
            subtitle="Set one active to get personalized match scores"
            action={
              <TouchableOpacity
                onPress={() => router.push('/(parent)/profile/child/new')}
                style={{ backgroundColor: '#0A66C2', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>+ Add Child</Text>
              </TouchableOpacity>
            }
          />

          {!children || children.length === 0 ? (
            <TouchableOpacity
              onPress={() => router.push('/(parent)/profile/child/new')}
              style={{ backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 2, borderColor: '#0A66C2', borderStyle: 'dashed', padding: 24, alignItems: 'center', marginBottom: 16 }}
            >
              <Text style={{ fontSize: 32, marginBottom: 8 }}>👶</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#0A66C2', marginBottom: 4 }}>Add Your First Child</Text>
              <Text style={{ fontSize: 13, color: '#888', textAlign: 'center' }}>
                Add your child's diagnosis and therapy needs to get personalized business recommendations.
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ marginBottom: 16 }}>
              {children.map((child) => (
                <ChildProfileCard
                  key={child.id}
                  child={child}
                  isActive={activeChild?.id === child.id}
                />
              ))}
              {/* Add another child */}
              <TouchableOpacity
                onPress={() => router.push('/(parent)/profile/child/new')}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderWidth: 1, borderColor: '#0A66C2', borderRadius: 12, borderStyle: 'dashed', gap: 6 }}
              >
                <Text style={{ color: '#0A66C2', fontSize: 13, fontWeight: '600' }}>+ Add Another Child</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Account */}
          <SectionTitle title="Account" />
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E0DFDB', paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16 }}>
            <Text style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>Email</Text>
            <Text style={{ fontSize: 14, color: '#191919', fontWeight: '500' }}>{user?.email ?? '—'}</Text>
          </View>

          {/* Sign Out */}
          <TouchableOpacity
            onPress={handleSignOut}
            style={{ borderWidth: 1, borderColor: '#E0DFDB', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8, backgroundColor: '#FFFFFF' }}
          >
            <Text style={{ color: '#CC0000', fontSize: 15, fontWeight: '600' }}>Sign Out</Text>
          </TouchableOpacity>

          {/* Delete Account */}
          <TouchableOpacity
            onPress={handleDeleteAccount}
            style={{ paddingVertical: 14, alignItems: 'center', marginTop: 8, marginBottom: 32 }}
          >
            <Text style={{ color: '#999', fontSize: 13, fontWeight: '500' }}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
