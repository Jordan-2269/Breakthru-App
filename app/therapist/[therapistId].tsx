import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { SectionTitle } from '@/components/layout/SectionTitle';

export default function TherapistScreen() {
  const { therapistId } = useLocalSearchParams<{ therapistId: string }>();
  const router = useRouter();

  const { data: therapist, isLoading } = useQuery({
    queryKey: ['therapist', therapistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('therapists')
        .select('*, listing:business_listings(name, address_city, address_state), specializations:therapist_specializations(service_types(*))')
        .eq('id', therapistId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !therapist) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#0A66C2" />
      </SafeAreaView>
    );
  }

  const specializations = therapist.specializations?.map((s: any) => s.service_types).filter(Boolean) ?? [];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScrollView>
        {/* Profile header */}
        <View className="bg-surface px-4 pt-6 pb-4 border-b border-border items-center">
          <Avatar uri={therapist.avatar_url} name={therapist.name} size="xl" border />
          <Text className="text-xl font-bold text-text-primary mt-3">{therapist.name}</Text>
          {therapist.title && (
            <Text className="text-sm text-primary font-medium mt-0.5">{therapist.title}</Text>
          )}
          {therapist.listing && (
            <Text className="text-sm text-text-secondary mt-1">
              {therapist.listing.name} ·{' '}
              {[therapist.listing.address_city, therapist.listing.address_state].filter(Boolean).join(', ')}
            </Text>
          )}
          <View className="flex-row items-center gap-2 mt-2">
            <StarRating rating={therapist.avg_rating} size={16} showCount count={therapist.review_count} />
          </View>
          {therapist.is_accepting_clients && (
            <View className="mt-2">
              <Badge label="Accepting New Clients" variant="success" />
            </View>
          )}
        </View>

        <View className="px-4 py-4 gap-4">
          {therapist.years_experience != null && (
            <View className="flex-row items-center gap-2 bg-surface border border-border rounded-xl p-4">
              <Text className="text-2xl">🎓</Text>
              <View>
                <Text className="text-sm font-semibold text-text-primary">{therapist.years_experience} Years Experience</Text>
                <Text className="text-xs text-text-secondary">Working with autism spectrum disorders</Text>
              </View>
            </View>
          )}

          {therapist.bio && (
            <View>
              <SectionTitle title="About" />
              <Text className="text-sm text-text-secondary leading-5">{therapist.bio}</Text>
            </View>
          )}

          {specializations.length > 0 && (
            <View>
              <SectionTitle title="Specializations" />
              <View className="flex-row flex-wrap gap-2">
                {specializations.map((s: any) => (
                  <Badge key={s.id} label={s.name} />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
