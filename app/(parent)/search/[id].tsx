import React from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, Linking
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBusinessDetail } from '@/hooks/useBusinessListings';
import { useOrCreateConversation } from '@/hooks/useMessages';
import { useSavedListingIds, useToggleSaveListing } from '@/hooks/useSavedListings';
import { useChildStore } from '@/store/childStore';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';
import { TherapistCard } from '@/components/listings/TherapistCard';
import { SectionTitle } from '@/components/layout/SectionTitle';
import { PRICE_RANGE_LABELS } from '@/lib/constants';

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: listing, isLoading } = useBusinessDetail(id);
  const { mutateAsync: getOrCreate, isPending } = useOrCreateConversation();
  const { data: savedIds } = useSavedListingIds();
  const { mutate: toggleSave } = useToggleSaveListing();
  const activeChild = useChildStore((s) => s.activeChild);
  const isSaved = savedIds?.has(id) ?? false;

  async function handleMessage() {
    const conv = await getOrCreate({ listingId: id, childId: activeChild?.id });
    router.push(`/(parent)/messages/${conv.id}`);
  }

  if (isLoading || !listing) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#0A66C2" />
      </SafeAreaView>
    );
  }

  const fullAddress = [
    listing.address_line1,
    listing.address_city,
    listing.address_state,
    listing.address_zip,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 left-4 z-10 bg-white rounded-full w-9 h-9 items-center justify-center shadow-sm"
      >
        <Text className="text-lg">←</Text>
      </TouchableOpacity>

      {/* Save button */}
      <TouchableOpacity
        onPress={() => toggleSave({ listingId: id, isSaved })}
        style={{
          position: 'absolute',
          top: 48,
          right: 16,
          zIndex: 10,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: isSaved ? '#EAF0F9' : '#FFFFFF',
          borderWidth: 1,
          borderColor: isSaved ? '#0A66C2' : '#E0DFDB',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Text style={{ fontSize: 18 }}>{isSaved ? '🔖' : '🏷️'}</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover image */}
        {listing.cover_image_url ? (
          <Image source={{ uri: listing.cover_image_url }} className="w-full h-48" resizeMode="cover" />
        ) : (
          <View className="w-full h-36 bg-primary-light" />
        )}

        {/* Logo + name header */}
        <View className="px-4 pb-4 bg-surface border-b border-border">
          <View className="-mt-8 mb-3">
            <View className="rounded-xl overflow-hidden border-4 border-white w-16 h-16">
              {listing.logo_url ? (
                <Image source={{ uri: listing.logo_url }} className="w-16 h-16" resizeMode="cover" />
              ) : (
                <View className="w-16 h-16 bg-primary items-center justify-center">
                  <Text className="text-white text-2xl font-bold">{listing.name[0]}</Text>
                </View>
              )}
            </View>
          </View>
          <Text className="text-2xl font-bold text-text-primary">{listing.name}</Text>
          {fullAddress && (
            <TouchableOpacity
              onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`)}
            >
              <Text className="text-sm text-primary mt-1">📍 {fullAddress}</Text>
            </TouchableOpacity>
          )}
          <View className="flex-row items-center gap-3 mt-2 flex-wrap">
            <StarRating rating={listing.avg_rating} size={14} showCount count={listing.review_count} />
            {listing.price_range && (
              <Badge label={PRICE_RANGE_LABELS[listing.price_range] ?? listing.price_range} />
            )}
            {!listing.is_claimed && <Badge label="Unclaimed" variant="unclaimed" />}
            {listing.accepting_new_clients && <Badge label="Accepting Clients" variant="success" />}
          </View>
        </View>

        <View className="px-4 py-4 gap-6">
          {/* Description */}
          {listing.description && (
            <View>
              <SectionTitle title="About" />
              <Text className="text-sm text-text-secondary leading-5">{listing.description}</Text>
            </View>
          )}

          {/* Services */}
          {listing.services && listing.services.length > 0 && (
            <View>
              <SectionTitle title="Services Offered" />
              <View className="flex-row flex-wrap gap-2">
                {listing.services.map((s: any) => (
                  <View key={s.service_type_id} className="bg-primary-light rounded-full px-3 py-1.5">
                    <Text className="text-primary text-sm font-medium">
                      {s.service_type?.name ?? ''}
                    </Text>
                    {s.price_from && (
                      <Text className="text-xs text-text-secondary">
                        ${s.price_from}{s.price_to ? `–$${s.price_to}` : '+'}/{s.price_unit}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Therapists */}
          {listing.therapists && listing.therapists.length > 0 && (
            <View>
              <SectionTitle title="Our Therapists" subtitle={`${listing.therapists.length} professionals`} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {listing.therapists.map((t: any) => (
                  <TherapistCard
                    key={t.id}
                    therapist={{
                      ...t,
                      specializations: t.specializations?.map((s: any) => s.service_types) ?? [],
                    }}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Contact */}
          <View>
            <SectionTitle title="Contact" />
            <View className="gap-2">
              {listing.phone && (
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${listing.phone}`)}>
                  <Text className="text-primary text-sm">📞 {listing.phone}</Text>
                </TouchableOpacity>
              )}
              {listing.email && (
                <TouchableOpacity onPress={() => Linking.openURL(`mailto:${listing.email}`)}>
                  <Text className="text-primary text-sm">✉️ {listing.email}</Text>
                </TouchableOpacity>
              )}
              {listing.website_url && (
                <TouchableOpacity onPress={() => Linking.openURL(listing.website_url!)}>
                  <Text className="text-primary text-sm">🌐 {listing.website_url}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Claim banner */}
          {!listing.is_claimed && (
            <View className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <Text className="text-sm font-semibold text-orange-800">Is this your business?</Text>
              <Text className="text-xs text-orange-700 mt-1">
                Claim this listing to update your information, add photos, and connect with families.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/sign-up')}
                className="mt-2 self-start"
              >
                <Text className="text-primary text-sm font-medium">Claim this business →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Message CTA */}
      {listing.is_claimed && listing.owner_id && (
        <View className="px-4 py-3 bg-surface border-t border-border">
          <Button
            label="Message Business"
            onPress={handleMessage}
            loading={isPending}
            fullWidth
            size="lg"
          />
        </View>
      )}
    </SafeAreaView>
  );
}
