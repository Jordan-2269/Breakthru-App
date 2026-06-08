import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Image, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export default function ClaimListingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const { data: results, isLoading, refetch } = useQuery({
    queryKey: ['unclaimed-search', search],
    queryFn: async () => {
      if (!search.trim()) return [];
      const { data, error } = await supabase
        .from('business_listings')
        .select('id, name, address_city, address_state, address_line1, phone, cover_image_url, logo_url')
        .eq('is_claimed', false)
        .eq('is_active', true)
        .ilike('name', `%${search.trim()}%`)
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
    enabled: search.trim().length >= 2,
  });

  async function handleClaim(listingId: string, listingName: string) {
    const confirmed = Platform.OS === 'web'
      ? window.confirm(`Claim "${listingName}"?\n\nYou will be set as the owner and can manage this listing.`)
      : await new Promise<boolean>((resolve) =>
          Alert.alert(
            'Claim this business?',
            `You are claiming "${listingName}". You will be set as the owner and can manage this listing.`,
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Claim', onPress: () => resolve(true) },
            ],
          ),
        );

    if (!confirmed) return;

    setClaimingId(listingId);
    try {
      const { error } = await supabase
        .from('business_listings')
        .update({ owner_id: user!.id, is_claimed: true })
        .eq('id', listingId)
        .eq('is_claimed', false);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ['my-listings'] });
      qc.invalidateQueries({ queryKey: ['business-stats'] });
      if (Platform.OS === 'web') {
        window.alert('Listing claimed! You can now edit your listing.');
        router.replace(`/(business)/listings/${listingId}/edit`);
      } else {
        Alert.alert(
          'Listing claimed!',
          'You can now edit your listing, add services, and connect with families.',
          [{ text: 'Edit Listing', onPress: () => router.replace(`/(business)/listings/${listingId}/edit`) }],
        );
      }
    } catch (e: any) {
      if (Platform.OS === 'web') {
        window.alert(`Error: ${(e as any).message}`);
      } else {
        Alert.alert('Error', (e as any).message);
      }
    } finally {
      setClaimingId(null);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F2EE' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8E8E8' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Text style={{ fontSize: 22, color: '#0A66C2' }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#191919' }}>Claim Your Business</Text>
          <Text style={{ fontSize: 12, color: '#888' }}>Search for your existing listing</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        {/* Search box */}
        <View style={{ margin: 16, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E8E8E8', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}>
          <Text style={{ fontSize: 18, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={{ flex: 1, paddingVertical: 14, fontSize: 15, color: '#191919' }}
            placeholder="Search by business name..."
            placeholderTextColor="#AAA"
            value={search}
            onChangeText={setSearch}
            autoFocus
            returnKeyType="search"
          />
        </View>

        {/* Info banner */}
        <View style={{ marginHorizontal: 16, marginBottom: 16, backgroundColor: '#EAF0F9', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#C0D8F0' }}>
          <Text style={{ fontSize: 13, color: '#0A66C2', fontWeight: '600', marginBottom: 2 }}>How claiming works</Text>
          <Text style={{ fontSize: 12, color: '#444', lineHeight: 18 }}>
            We've imported autism therapy businesses from Google. Search for yours, claim it, and you'll be able to edit your info, respond to families, and appear higher in search results.
          </Text>
        </View>

        {/* Loading */}
        {isLoading && (
          <View style={{ alignItems: 'center', paddingVertical: 32 }}>
            <ActivityIndicator color="#0A66C2" />
          </View>
        )}

        {/* Empty search */}
        {!isLoading && search.trim().length < 2 && (
          <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 32 }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>🏥</Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#191919', textAlign: 'center' }}>
              Search for your business
            </Text>
            <Text style={{ fontSize: 13, color: '#888', textAlign: 'center', marginTop: 6 }}>
              Type at least 2 characters to search. If your business isn't listed, you can create a new one.
            </Text>
          </View>
        )}

        {/* No results */}
        {!isLoading && search.trim().length >= 2 && results?.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 32 }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>🔎</Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#191919', textAlign: 'center' }}>
              No results for "{search}"
            </Text>
            <Text style={{ fontSize: 13, color: '#888', textAlign: 'center', marginTop: 6, marginBottom: 20 }}>
              Your business may not be imported yet, or it may already be claimed.
            </Text>
            <Button
              label="Create a New Listing"
              onPress={() => router.replace('/(business)/listings/new')}
              fullWidth
            />
          </View>
        )}

        {/* Results */}
        {results && results.length > 0 && (
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 13, color: '#888', marginBottom: 10 }}>
              {results.length} result{results.length !== 1 ? 's' : ''} — tap Claim to take ownership
            </Text>
            {results.map((item: any) => (
              <View
                key={item.id}
                style={{ backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E8E8E8', marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 }}
              >
                <View style={{ flexDirection: 'row' }}>
                  {/* Photo / placeholder */}
                  {item.cover_image_url ? (
                    <Image source={{ uri: item.cover_image_url }} style={{ width: 90, height: 90 }} resizeMode="cover" />
                  ) : (
                    <View style={{ width: 90, height: 90, backgroundColor: '#0A66C2', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 32, fontWeight: '900', color: 'rgba(255,255,255,0.9)' }}>
                        {item.name[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={{ flex: 1, padding: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#191919' }} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#777', marginTop: 3 }}>
                      📍 {[item.address_city, item.address_state].filter(Boolean).join(', ')}
                    </Text>
                    {item.phone && (
                      <Text style={{ fontSize: 12, color: '#777', marginTop: 2 }}>📞 {item.phone}</Text>
                    )}
                  </View>
                </View>
                <View style={{ padding: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F0F0F0' }}>
                  <TouchableOpacity
                    onPress={() => handleClaim(item.id, item.name)}
                    disabled={claimingId === item.id}
                    style={{ backgroundColor: '#0A66C2', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
                  >
                    {claimingId === item.id ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Claim This Business</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
