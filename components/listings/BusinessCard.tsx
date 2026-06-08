import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StarRating } from '@/components/ui/StarRating';
import { MatchScoreBadge } from './MatchScoreBadge';
import { useSavedListingIds, useToggleSaveListing } from '@/hooks/useSavedListings';
import { getMatchColor, getMatchLabel } from '@/lib/matchScore';
import type { MatchedListing } from '@/types/app';
import { PRICE_RANGE_LABELS } from '@/lib/constants';

type Props = {
  listing: MatchedListing;
  showMatchScore?: boolean;
  highlighted?: boolean;
};

const ACCENT_COLORS: Record<string, string> = {
  A: '#E53E3E', B: '#0A66C2', C: '#805AD5', D: '#D69E2E',
  E: '#2B8A3E', F: '#C05621', G: '#0987A0', H: '#97266D',
  I: '#285E61', J: '#744210', K: '#22543D', L: '#553C9A',
  M: '#702459', N: '#1A365D', O: '#7B341E', P: '#276749',
  Q: '#2A4365', R: '#9B2335', S: '#2C7A7B', T: '#6B46C1',
  U: '#C05621', V: '#276749', W: '#2B6CB0', X: '#553C9A',
  Y: '#975A16', Z: '#2C7A7B',
};

export function BusinessCard({ listing, showMatchScore = true, highlighted = false }: Props) {
  const router = useRouter();
  const { data: savedIds } = useSavedListingIds();
  const { mutate: toggleSave } = useToggleSaveListing();
  const isSaved = savedIds?.has(listing.id) ?? false;

  const initial = listing.name[0].toUpperCase();
  const accentColor = ACCENT_COLORS[initial] ?? '#0A66C2';
  const cityState = [listing.address_city, listing.address_state].filter(Boolean).join(', ');
  const distance = listing.distance_km != null
    ? listing.distance_km < 1 ? '<1 km away' : `${listing.distance_km.toFixed(1)} km away`
    : null;

  const hasScore = showMatchScore && listing.matchScore > 0;
  const scoreColor = hasScore ? getMatchColor(listing.matchScore) : null;
  const scoreLabel = hasScore ? getMatchLabel(listing.matchScore) : null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/(parent)/search/${listing.id}`)}
      style={{ marginBottom: 12 }}
    >
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          borderWidth: highlighted ? 2 : 1,
          borderColor: highlighted ? '#0A66C2' : '#E8E8E8',
          flexDirection: 'row',
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.09,
          shadowRadius: 10,
          elevation: 4,
        }}
      >
        {/* Colored left accent strip based on match score */}
        {hasScore && (
          <View style={{ width: 4, backgroundColor: scoreColor! }} />
        )}

        {/* Left: Photo or colored placeholder */}
        <View style={{ width: 108, position: 'relative' }}>
          {listing.cover_image_url ? (
            <Image
              source={{ uri: listing.cover_image_url }}
              style={{ width: 108, height: '100%', minHeight: 130 }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: 108,
                minHeight: 130,
                flex: 1,
                backgroundColor: accentColor,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 42, fontWeight: '900', color: 'rgba(255,255,255,0.9)' }}>
                {initial}
              </Text>
            </View>
          )}

          {/* Match score badge over image */}
          {hasScore && (
            <View style={{ position: 'absolute', top: 8, left: 6 }}>
              <MatchScoreBadge score={listing.matchScore} size="sm" />
            </View>
          )}
        </View>

        {/* Right: Content */}
        <View style={{ flex: 1, padding: 13, justifyContent: 'space-between' }}>
          {/* Top row: Name + save */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
            <Text
              style={{ fontSize: 15, fontWeight: '700', color: '#191919', flex: 1, lineHeight: 21 }}
              numberOfLines={2}
            >
              {listing.name}
            </Text>
            <TouchableOpacity
              onPress={() => toggleSave({ listingId: listing.id, isSaved })}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ marginTop: 1 }}
            >
              <Text style={{ fontSize: 18 }}>{isSaved ? '🔖' : '🏷️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Location + distance */}
          {(cityState || distance) && (
            <Text style={{ fontSize: 12, color: '#777777', marginTop: 4, lineHeight: 17 }}>
              📍 {[cityState, distance].filter(Boolean).join(' · ')}
            </Text>
          )}

          {/* Stars + rating */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 }}>
            <StarRating rating={listing.avg_rating} size={12} />
            <Text style={{ fontSize: 12, color: '#444444', fontWeight: '600' }}>
              {listing.avg_rating.toFixed(1)}
            </Text>
            {listing.review_count > 0 && (
              <Text style={{ fontSize: 12, color: '#888888' }}>({listing.review_count})</Text>
            )}
          </View>

          {/* Bottom badges row */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
            {/* Match label pill */}
            {hasScore && (
              <View style={{
                backgroundColor: scoreColor! + '18',
                borderRadius: 20,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderWidth: 1,
                borderColor: scoreColor! + '55',
              }}>
                <Text style={{ fontSize: 11, color: scoreColor!, fontWeight: '700' }}>
                  {scoreLabel}
                </Text>
              </View>
            )}

            {listing.price_range && (
              <View style={{ backgroundColor: '#F0FBF4', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: '#A8E6C0' }}>
                <Text style={{ fontSize: 11, color: '#1A8C4E', fontWeight: '600' }}>
                  {PRICE_RANGE_LABELS[listing.price_range] ?? listing.price_range}
                </Text>
              </View>
            )}
            {!listing.is_claimed && (
              <View style={{ backgroundColor: '#FFF8EE', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: '#FFD89A' }}>
                <Text style={{ fontSize: 11, color: '#C07000', fontWeight: '600' }}>Unclaimed</Text>
              </View>
            )}
            {listing.accepting_new_clients === false && (
              <View style={{ backgroundColor: '#F5F4F2', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: '#DDDBD6' }}>
                <Text style={{ fontSize: 11, color: '#666666', fontWeight: '600' }}>Not Accepting</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
