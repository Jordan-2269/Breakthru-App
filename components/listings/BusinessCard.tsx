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
  compact?: boolean;
};

const ACCENT_COLORS: Record<string, string> = {
  A: '#E53E3E', B: '#1D9BF0', C: '#805AD5', D: '#D69E2E',
  E: '#2B8A3E', F: '#FF6B35', G: '#0987A0', H: '#97266D',
  I: '#285E61', J: '#744210', K: '#22543D', L: '#553C9A',
  M: '#702459', N: '#1A365D', O: '#7B341E', P: '#276749',
  Q: '#2A4365', R: '#9B2335', S: '#2C7A7B', T: '#6B46C1',
  U: '#FF6B35', V: '#276749', W: '#2B6CB0', X: '#553C9A',
  Y: '#975A16', Z: '#2C7A7B',
};

export function BusinessCard({ listing, showMatchScore = true, highlighted = false, compact = false }: Props) {
  const router = useRouter();
  const { data: savedIds } = useSavedListingIds();
  const { mutate: toggleSave } = useToggleSaveListing();
  const isSaved = savedIds?.has(listing.id) ?? false;

  const initial = listing.name[0].toUpperCase();
  const accentColor = ACCENT_COLORS[initial] ?? '#1D9BF0';
  const cityState = [listing.address_city, listing.address_state].filter(Boolean).join(', ');
  const distance = listing.distance_km != null
    ? listing.distance_km < 1 ? '<1 km away' : `${listing.distance_km.toFixed(1)} km away`
    : null;

  const scoreColor = showMatchScore ? getMatchColor(listing.matchScore) : null;
  const scoreLabel = showMatchScore ? getMatchLabel(listing.matchScore) : null;

  if (compact) {
    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => router.push(`/(parent)/search/${listing.id}`)}
        style={{ flex: 1, margin: 2 }}
      >
        <View style={{
          borderRadius: 10,
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.09,
          shadowRadius: 6,
          elevation: 3,
          borderWidth: highlighted ? 2 : 0,
          borderColor: highlighted ? '#1D9BF0' : 'transparent',
        }}>
          {/* Square thumbnail */}
          <View style={{ aspectRatio: 1, width: '100%', position: 'relative' }}>
            {listing.cover_image_url ? (
              <Image source={{ uri: listing.cover_image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <View style={{ flex: 1, backgroundColor: accentColor, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 36, fontWeight: '900', color: 'rgba(255,255,255,0.92)' }}>{initial}</Text>
              </View>
            )}
            {/* Save button */}
            <TouchableOpacity
              onPress={() => toggleSave({ listingId: listing.id, isSaved })}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{
                position: 'absolute', top: 6, left: 6,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 14, width: 26, height: 26,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 11 }}>{isSaved ? '🔖' : '🏷️'}</Text>
            </TouchableOpacity>
            {/* Match badge */}
            {showMatchScore && (
              <View style={{ position: 'absolute', top: 6, right: 6 }}>
                <MatchScoreBadge score={listing.matchScore} size="sm" />
              </View>
            )}
            {listing.accepting_new_clients === false && (
              <View style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                backgroundColor: 'rgba(0,0,0,0.65)',
                paddingVertical: 3, alignItems: 'center',
              }}>
                <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '700', letterSpacing: 0.3 }}>CLOSED</Text>
              </View>
            )}
          </View>
          {/* Info */}
          <View style={{ padding: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F0F0F', lineHeight: 17 }} numberOfLines={1}>
              {listing.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
              <Text style={{ fontSize: 11, color: '#F59E0B' }}>★</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#0F0F0F' }}>{listing.avg_rating.toFixed(1)}</Text>
              {listing.review_count > 0 && (
                <Text style={{ fontSize: 11, color: '#909090' }}>({listing.review_count})</Text>
              )}
            </View>
            {cityState ? (
              <Text style={{ fontSize: 11, color: '#909090', marginTop: 2 }} numberOfLines={1}>{cityState}</Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => router.push(`/(parent)/search/${listing.id}`)}
      style={{ marginBottom: 16 }}
    >
      <View style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.13,
        shadowRadius: 12,
        elevation: 6,
        borderWidth: highlighted ? 2 : 0,
        borderColor: highlighted ? '#1D9BF0' : 'transparent',
      }}>
        {/* Thumbnail — YouTube style 16:9 */}
        <View style={{ aspectRatio: 16 / 9, width: '100%', position: 'relative' }}>
          {listing.cover_image_url ? (
            <Image
              source={{ uri: listing.cover_image_url }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View style={{
              flex: 1,
              backgroundColor: accentColor,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 56, fontWeight: '900', color: 'rgba(255,255,255,0.92)' }}>
                {initial}
              </Text>
            </View>
          )}

          {/* Save button — top left */}
          <TouchableOpacity
            onPress={() => toggleSave({ listingId: listing.id, isSaved })}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              position: 'absolute', top: 10, left: 10,
              backgroundColor: 'rgba(0,0,0,0.55)',
              borderRadius: 20, width: 34, height: 34,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 16 }}>{isSaved ? '🔖' : '🏷️'}</Text>
          </TouchableOpacity>

          {/* Match score — top right */}
          {showMatchScore && (
            <View style={{ position: 'absolute', top: 10, right: 10 }}>
              <MatchScoreBadge score={listing.matchScore} size="sm" />
            </View>
          )}

          {/* Not accepting clients banner */}
          {listing.accepting_new_clients === false && (
            <View style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              backgroundColor: 'rgba(0,0,0,0.72)',
              paddingVertical: 5, alignItems: 'center',
            }}>
              <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>
                NOT ACCEPTING NEW CLIENTS
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={{ padding: 14 }}>
          {/* Name row */}
          <Text
            style={{ fontSize: 16, fontWeight: '800', color: '#0F0F0F', lineHeight: 22, marginBottom: 6 }}
            numberOfLines={2}
          >
            {listing.name}
          </Text>

          {/* Meta row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            <StarRating rating={listing.avg_rating} size={13} />
            <Text style={{ fontSize: 13, color: '#0F0F0F', fontWeight: '700' }}>
              {listing.avg_rating.toFixed(1)}
            </Text>
            {listing.review_count > 0 && (
              <Text style={{ fontSize: 13, color: '#606060' }}>({listing.review_count})</Text>
            )}
            {cityState ? (
              <Text style={{ fontSize: 13, color: '#606060' }}>· {cityState}</Text>
            ) : null}
            {distance ? (
              <Text style={{ fontSize: 13, color: '#606060' }}>· {distance}</Text>
            ) : null}
          </View>

          {/* Tags row */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {showMatchScore && scoreLabel && (
              <View style={{
                backgroundColor: scoreColor! + '18',
                borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
                borderWidth: 1, borderColor: scoreColor! + '55',
              }}>
                <Text style={{ fontSize: 11, color: scoreColor!, fontWeight: '800' }}>
                  {scoreLabel}
                </Text>
              </View>
            )}
            {listing.price_range && (
              <View style={{ backgroundColor: '#F0FBF4', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontSize: 11, color: '#00875A', fontWeight: '700' }}>
                  {PRICE_RANGE_LABELS[listing.price_range] ?? listing.price_range}
                </Text>
              </View>
            )}
            {!listing.is_claimed && (
              <View style={{ backgroundColor: '#FFF8E7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontSize: 11, color: '#C07000', fontWeight: '700' }}>Unclaimed</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
