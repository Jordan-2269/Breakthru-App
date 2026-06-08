import React, { useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, Linking, Modal, TextInput
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBusinessDetail } from '@/hooks/useBusinessListings';
import { useOrCreateConversation } from '@/hooks/useMessages';
import { useSavedListingIds, useToggleSaveListing } from '@/hooks/useSavedListings';
import { useListingReviews, useMyReview, useSubmitReview } from '@/hooks/useReviews';
import { useChildStore } from '@/store/childStore';
import { useAuth } from '@/lib/auth';
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
  const { role } = useAuth();
  const { data: listing, isLoading } = useBusinessDetail(id);
  const { mutateAsync: getOrCreate, isPending } = useOrCreateConversation();
  const { data: savedIds } = useSavedListingIds();
  const { mutate: toggleSave } = useToggleSaveListing();
  const { data: reviews } = useListingReviews(id);
  const { data: myReview } = useMyReview(id);
  const { mutate: submitReview, isPending: submittingReview } = useSubmitReview(id);
  const activeChild = useChildStore((s) => s.activeChild);
  const isSaved = savedIds?.has(id) ?? false;

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(myReview?.rating ?? 5);
  const [reviewTitle, setReviewTitle] = useState(myReview?.title ?? '');
  const [reviewBody, setReviewBody] = useState(myReview?.body ?? '');

  function openReviewModal() {
    setReviewRating(myReview?.rating ?? 5);
    setReviewTitle(myReview?.title ?? '');
    setReviewBody(myReview?.body ?? '');
    setShowReviewModal(true);
  }

  function handleSubmitReview() {
    submitReview(
      { rating: reviewRating, title: reviewTitle, body: reviewBody },
      { onSuccess: () => setShowReviewModal(false) },
    );
  }

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

          {/* Reviews */}
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <SectionTitle title={`Reviews (${listing.review_count ?? 0})`} />
              {role === 'parent' && (
                <TouchableOpacity
                  onPress={openReviewModal}
                  style={{ backgroundColor: '#0A66C2', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}
                >
                  <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>
                    {myReview ? 'Edit Review' : '+ Write Review'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {reviews && reviews.length > 0 ? (
              reviews.map((r) => (
                <View key={r.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E8E8E8', padding: 14, marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Avatar name={r.reviewer?.display_name ?? 'A'} uri={r.reviewer?.avatar_url} size="sm" />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#191919' }}>
                        {r.reviewer?.display_name ?? 'Anonymous'}
                      </Text>
                      <StarRating rating={r.rating} size={11} />
                    </View>
                    <Text style={{ fontSize: 11, color: '#999' }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  {r.title && <Text style={{ fontSize: 13, fontWeight: '600', color: '#191919', marginBottom: 4 }}>{r.title}</Text>}
                  {r.body && <Text style={{ fontSize: 13, color: '#555', lineHeight: 19 }}>{r.body}</Text>}
                </View>
              ))
            ) : (
              <Text style={{ fontSize: 13, color: '#999', fontStyle: 'italic' }}>No reviews yet. Be the first to review!</Text>
            )}
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
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E8E8E8' }}>
        <Button
          label="Message Business"
          onPress={handleMessage}
          loading={isPending}
          fullWidth
          size="lg"
        />
        {!listing.is_claimed && (
          <Text style={{ fontSize: 11, color: '#999', textAlign: 'center', marginTop: 6 }}>
            This listing is unclaimed — your message will be saved for when they join.
          </Text>
        )}
      </View>

      {/* Review Modal */}
      <Modal visible={showReviewModal} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setShowReviewModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F2EE' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8E8E8' }}>
            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
              <Text style={{ color: '#0A66C2', fontSize: 15 }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#191919' }}>
              {myReview ? 'Edit Review' : 'Write a Review'}
            </Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#191919', marginBottom: 12 }}>Your Rating</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                  <Text style={{ fontSize: 36, opacity: star <= reviewRating ? 1 : 0.25 }}>⭐</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ fontSize: 14, fontWeight: '600', color: '#191919', marginBottom: 6 }}>Title (optional)</Text>
            <TextInput
              value={reviewTitle}
              onChangeText={setReviewTitle}
              placeholder="Summarise your experience…"
              placeholderTextColor="#AAA"
              style={{ backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', padding: 12, fontSize: 14, color: '#191919', marginBottom: 16, outlineWidth: 0 } as any}
            />

            <Text style={{ fontSize: 14, fontWeight: '600', color: '#191919', marginBottom: 6 }}>Review (optional)</Text>
            <TextInput
              value={reviewBody}
              onChangeText={setReviewBody}
              placeholder="Tell families about your experience…"
              placeholderTextColor="#AAA"
              multiline
              numberOfLines={5}
              style={{ backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', padding: 12, fontSize: 14, color: '#191919', minHeight: 110, textAlignVertical: 'top', marginBottom: 24, outlineWidth: 0 } as any}
            />

            <TouchableOpacity
              onPress={handleSubmitReview}
              disabled={submittingReview}
              style={{ backgroundColor: '#0A66C2', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
            >
              {submittingReview
                ? <ActivityIndicator color="#FFF" />
                : <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '700' }}>Submit Review</Text>
              }
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
