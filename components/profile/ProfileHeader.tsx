import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';

type Props = {
  name: string;
  subtitle?: string;
  avatarUri?: string | null;
  coverUri?: string | null;
  onEditPress?: () => void;
};

export function ProfileHeader({ name, subtitle, avatarUri, coverUri, onEditPress }: Props) {
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
          <Avatar uri={avatarUri} name={name} size="xl" border />
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
