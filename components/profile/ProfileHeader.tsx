import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';

type Props = {
  name: string;
  subtitle?: string;
  avatarUri?: string | null;
  coverUri?: string | null;
  onEditPress?: () => void;
  onAvatarPress?: () => void;
  avatarUploading?: boolean;
};

export function ProfileHeader({ name, subtitle, avatarUri, coverUri, onEditPress, onAvatarPress, avatarUploading }: Props) {
  return (
    <View className="bg-surface mb-2">
      {/* Cover */}
      {coverUri ? (
        <Image source={{ uri: coverUri }} className="w-full h-36" resizeMode="cover" />
      ) : (
        <View className="w-full h-36 bg-primary-light" />
      )}

      {/* Avatar overlapping cover */}
      <View className="px-4 pb-4">
        <View className="-mt-10 mb-2">
          <TouchableOpacity
            onPress={onAvatarPress}
            disabled={!onAvatarPress || avatarUploading}
            activeOpacity={onAvatarPress ? 0.8 : 1}
            style={{ position: 'relative', alignSelf: 'flex-start' }}
          >
            <Avatar uri={avatarUri} name={name} size="xl" border />

            {/* Camera overlay badge */}
            {onAvatarPress && (
              <View style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: '#0A66C2',
                borderWidth: 2,
                borderColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {avatarUploading
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : <Text style={{ fontSize: 13 }}>📷</Text>
                }
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-xl font-bold text-text-primary">{name}</Text>
            {subtitle && (
              <Text className="text-sm text-text-secondary mt-0.5">{subtitle}</Text>
            )}
          </View>
          {onEditPress && (
            <TouchableOpacity
              onPress={onEditPress}
              className="border border-primary rounded-full px-4 py-1.5"
            >
              <Text className="text-primary text-sm font-medium">Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
