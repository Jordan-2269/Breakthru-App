import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { BusinessCard } from '@/components/listings/BusinessCard';
import type { MatchedListing } from '@/types/app';

export default function SavedScreen() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['saved-listings', user?.id],
    queryFn: async (): Promise<MatchedListing[]> => {
      const { data, error } = await supabase
        .from('saved_listings')
        .select('listing_id, business_listings(*)')
        .eq('parent_id', user!.id)
        .order('saved_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        ...row.business_listings,
        distance_km: 0,
        matchScore: 0,
        serviceMatchScore: 0,
        proximityScore: 0,
        qualityScore: 0,
        matchedServiceIds: [],
      }));
    },
    enabled: !!user,
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-4 pt-2 pb-3 bg-surface border-b border-border">
        <Text className="text-xl font-bold text-text-primary">Saved</Text>
      </View>

      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0A66C2" />
        </View>
      )}

      {!isLoading && (!data || data.length === 0) && (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-3xl mb-3">🔖</Text>
          <Text className="text-base font-semibold text-text-primary text-center">No saved services yet</Text>
          <Text className="text-sm text-text-secondary text-center mt-2">
            Bookmark businesses from the Search tab to find them here.
          </Text>
        </View>
      )}

      {data && data.length > 0 && (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BusinessCard listing={item} showMatchScore={false} />}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </SafeAreaView>
  );
}
