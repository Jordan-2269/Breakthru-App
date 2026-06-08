import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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

  const router = useRouter();

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
            <Text className="text-4xl mb-3">👋</Text>
            <Text className="text-base font-bold text-text-primary">Welcome to Breakthru Autism Services!</Text>
            <Text className="text-sm text-text-secondary text-center mt-1 mb-5 px-4">
              Is your clinic already listed? Search for it and claim it. Otherwise, create a brand-new listing.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(business)/listings/claim')}
              style={{ backgroundColor: '#0A66C2', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 14, marginBottom: 10, width: '100%', alignItems: 'center' }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>🔍 Claim My Existing Business</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(business)/listings/new')}
              style={{ borderWidth: 1, borderColor: '#0A66C2', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 14, width: '100%', alignItems: 'center' }}
            >
              <Text style={{ color: '#0A66C2', fontWeight: '600', fontSize: 15 }}>+ Create a New Listing</Text>
            </TouchableOpacity>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
