import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/ui/Avatar';
import { StarRating } from '@/components/ui/StarRating';
import { Badge } from '@/components/ui/Badge';
import type { Therapist, ServiceType } from '@/types/app';

type Props = {
  therapist: Therapist & { specializations: ServiceType[] };
};

export function TherapistCard({ therapist }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/therapist/${therapist.id}`)}
      className="bg-surface border border-border rounded-lg p-3 mr-3 w-52"
    >
      <View className="items-center mb-2">
        <Avatar uri={therapist.avatar_url} name={therapist.name} size="lg" />
        {therapist.is_accepting_clients && (
          <View className="absolute top-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-white" />
        )}
      </View>
      <Text className="text-sm font-semibold text-text-primary text-center" numberOfLines={1}>
        {therapist.name}
      </Text>
      {therapist.title && (
        <Text className="text-xs text-text-secondary text-center mt-0.5" numberOfLines={1}>
          {therapist.title}
        </Text>
      )}
      {therapist.years_experience != null && (
        <Text className="text-xs text-text-tertiary text-center">
          {therapist.years_experience} yr{therapist.years_experience !== 1 ? 's' : ''} experience
        </Text>
      )}
      <View className="items-center mt-1">
        <StarRating rating={therapist.avg_rating} size={12} showCount count={therapist.review_count} />
      </View>
      <View className="flex-row flex-wrap gap-1 mt-2 justify-center">
        {therapist.specializations.slice(0, 2).map((s) => (
          <Badge key={s.id} label={s.name} small />
        ))}
      </View>
    </TouchableOpacity>
  );
}
