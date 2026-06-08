import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocation } from '@/hooks/useLocation';
import { useBusinessListings } from '@/hooks/useBusinessListings';
import { useChildStore } from '@/store/childStore';
import { BusinessCard } from '@/components/listings/BusinessCard';
import { MapSection } from '@/components/search/MapSection';
import { supabase } from '@/lib/supabase';
import type { MatchedListing } from '@/types/app';

type Tab = 'list' | 'map';

export default function SearchScreen() {
  const userCoords = useLocation();
  const { data: listings, isLoading } = useBusinessListings();
  const activeChild = useChildStore((s) => s.activeChild);
  const [activeTab, setActiveTab] = useState<Tab>('list');
  const [selectedListing, setSelectedListing] = useState<MatchedListing | null>(null);

  // Auto-sync Google Places businesses near the user on load
  useEffect(() => {
    if (!userCoords) return;
    supabase.functions
      .invoke('sync-places', {
        body: { lat: userCoords.latitude, lng: userCoords.longitude, radius: 25 },
      })
      .catch(() => {});
  }, [userCoords?.latitude, userCoords?.longitude]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F2EE' }} edges={['top']}>
      {/* Header */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E0DFDB',
        }}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#191919' }}>
            Find Services
          </Text>
          {activeChild && (
            <Text style={{ fontSize: 13, color: '#0A66C2', marginTop: 1 }}>
              Matching for {activeChild.name}
            </Text>
          )}
        </View>

        {/* Tab bar */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16 }}>
          {(['list', 'map'] as Tab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                marginRight: 4,
                borderBottomWidth: 2,
                borderBottomColor: activeTab === tab ? '#0A66C2' : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: activeTab === tab ? '700' : '500',
                  color: activeTab === tab ? '#0A66C2' : '#666666',
                }}
              >
                {tab === 'list' ? '≡  List' : '🗺  Map'}
              </Text>
            </TouchableOpacity>
          ))}

          {userCoords && !isLoading && listings && listings.length > 0 && (
            <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 4 }}>
              <Text style={{ fontSize: 12, color: '#999999' }}>
                {listings.length} services
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* No location */}
      {!userCoords && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Text style={{ fontSize: 36, marginBottom: 12 }}>📍</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#191919', textAlign: 'center' }}>
            Allow location access to find services near you
          </Text>
          <Text style={{ fontSize: 13, color: '#666666', textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
            We use your location to show autism services in your area.
          </Text>
        </View>
      )}

      {/* Loading */}
      {userCoords && isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#0A66C2" />
          <Text style={{ color: '#666666', marginTop: 12 }}>Finding services near you...</Text>
        </View>
      )}

      {/* List tab */}
      {userCoords && !isLoading && activeTab === 'list' && (
        <>
          {(!listings || listings.length === 0) ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
              <Text style={{ fontSize: 36, marginBottom: 12 }}>🔍</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#191919', textAlign: 'center' }}>
                No services found nearby
              </Text>
              <Text style={{ fontSize: 13, color: '#666666', textAlign: 'center', marginTop: 8 }}>
                Try increasing your search radius in filters.
              </Text>
            </View>
          ) : (
            <FlatList
              data={listings}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <BusinessCard
                  listing={item}
                  highlighted={selectedListing?.id === item.id}
                />
              )}
              contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}

      {/* Map tab */}
      {userCoords && !isLoading && activeTab === 'map' && (
        <View style={{ flex: 1 }}>
          <MapSection
            userCoords={userCoords}
            listings={listings ?? []}
            onSelectListing={(l) => {
              setSelectedListing(l);
            }}
            selectedListing={selectedListing}
            fullScreen
          />
        </View>
      )}
    </SafeAreaView>
  );
}
