import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';
import { useUpdateAvatar } from '@/hooks/useUpdateAvatar';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';

export default function BusinessProfileScreen() {
  const { profile, signOut, user } = useAuth();
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
      ? window.confirm('Delete your account permanently?\n\nThis will remove your profile, all listings, and all data. This cannot be undone.')
      : await new Promise<boolean>((resolve) =>
          Alert.alert(
            'Delete Account',
            'This will permanently delete your account, all listings, and all data. This cannot be undone.',
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
      <ScrollView>
        <ProfileHeader
          name={profile?.display_name ?? 'My Business'}
          subtitle="Service Provider"
          avatarUri={profile?.avatar_url}
          onAvatarPress={pickAndUpload}
          avatarUploading={isUploading}
        />
        <View style={{ paddingHorizontal: 16, paddingTop: 8, gap: 12 }}>
          <Card>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#191919', marginBottom: 2 }}>Account Email</Text>
            <Text style={{ fontSize: 13, color: '#666' }}>{user?.email ?? '—'}</Text>
          </Card>
          {profile?.phone && (
            <Card>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#191919', marginBottom: 2 }}>Phone</Text>
              <Text style={{ fontSize: 13, color: '#666' }}>{profile.phone}</Text>
            </Card>
          )}

          <TouchableOpacity
            onPress={handleSignOut}
            style={{ borderWidth: 1, borderColor: '#E0DFDB', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8, backgroundColor: '#FFFFFF' }}
          >
            <Text style={{ color: '#CC0000', fontSize: 15, fontWeight: '600' }}>Sign Out</Text>
          </TouchableOpacity>

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
