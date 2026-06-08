import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';

export default function DashboardScreen() {
  const { profile, user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['business-stats', user?.id],
    queryFn: async () => {
      const { data: listings } = await supabase
        .from('business_listings')
        .select('id, name, avg_rating, review_count')
        .eq('owner_id', user!.id);

      const listingIds = (listings ?? []).map((l: any) => l.id);

      let messageCount = 0;
      if (listingIds.length > 0) {
        const { count } = await supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .in('listing_id', listingIds);
        messageCount = count ?? 0;
      }

      return {
        listingCount: listings?.length ?? 0,
        messageCount,
        listings: listings ?? [],
      };
    },
    enabled: !!user,
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-4 pt-2 pb-3 bg-surface border-b border-border">
        <Text className="text-xl font-bold text-text-primary">Dashboard</Text>
        <Text className="text-sm text-text-secondary">{profile?.display_name}</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Stats row */}
        <View className="flex-row gap-3 mb-6">
          {[
            { label: 'Listings', value: stats?.listingCount ?? 0, emoji: '🏥' },
            { label: 'Conversations', value: stats?.messageCount ?? 0, emoji: '💬' },
          ].map((s) => (
            <Card key={s.label} className="flex-1 items-center py-5">
              <Text className="text-2xl">{s.emoji}</Text>
              <Text className="text-2xl font-bold text-text-primary mt-1">{s.value}</Text>
              <Text className="text-xs text-text-secondary">{s.label}</Text>
            </Card>
          ))}
        </View>

        {/* Listings summary */}
        {stats?.listings?.length > 0 && (
          <View>
            <Text className="text-base font-semibold text-text-primary mb-3">Your Listings</Text>
            {stats.listings.map((l: any) => (
              <Card key={l.id} className="mb-3">
                <Text className="text-sm font-semibold text-text-primary">{l.name}</Text>
                <Text className="text-xs text-text-secondary mt-1">
                  ⭐ {Number(l.avg_rating).toFixed(1)} · {l.review_count} review{l.review_count !== 1 ? 's' : ''}
                </Text>
              </Card>
            ))}
          </View>
        )}

        {(!stats?.listings || stats.listings.length === 0) && (
          <Card className="items-center py-8">
            <Text className="text-3xl mb-2">🏥</Text>
            <Text className="text-sm font-semibold text-text-primary">No listings yet</Text>
            <Text className="text-xs text-text-secondary text-center mt-1">
              Go to the Listings tab to create your first listing.
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
