import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { StarRating } from '@/components/ui/StarRating';

export default function BusinessListingsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: listings, isLoading } = useQuery({
    queryKey: ['my-listings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_listings')
        .select('*')
        .eq('owner_id', user!.id)
        .order('created_at');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 pt-2 pb-3 bg-surface border-b border-border">
        <Text className="text-xl font-bold text-text-primary">My Listings</Text>
        <TouchableOpacity
          onPress={() => router.push('/(business)/listings/new')}
          className="bg-primary rounded-full px-4 py-1.5"
        >
          <Text className="text-white text-sm font-medium">+ Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0A66C2" />
        </View>
      )}

      {!isLoading && (!listings || listings.length === 0) && (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-3xl mb-3">🏥</Text>
          <Text className="text-base font-semibold text-text-primary text-center">No listings yet</Text>
          <Text className="text-sm text-text-secondary text-center mt-2">
            Create your first listing so families can find your services.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(business)/listings/new')}
            className="mt-4 bg-primary rounded-full px-6 py-2.5"
          >
            <Text className="text-white font-medium">Create Listing</Text>
          </TouchableOpacity>
        </View>
      )}

      {listings && listings.length > 0 && (
        <FlatList
          data={listings}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }: { item: any }) => (
            <Card className="mb-3">
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-text-primary">{item.name}</Text>
                  <Text className="text-sm text-text-secondary mt-0.5">
                    {[item.address_city, item.address_state].filter(Boolean).join(', ')}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-1">
                    <StarRating rating={item.avg_rating} size={12} />
                    <Text className="text-xs text-text-secondary">({item.review_count})</Text>
                  </View>
                </View>
                <View className="gap-2">
                  <TouchableOpacity
                    onPress={() => router.push(`/(business)/listings/${item.id}/edit`)}
                    className="border border-primary rounded-full px-3 py-1"
                  >
                    <Text className="text-primary text-xs">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.push(`/(business)/listings/${item.id}/therapists`)}
                    className="border border-border rounded-full px-3 py-1"
                  >
                    <Text className="text-text-secondary text-xs">Therapists</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}
