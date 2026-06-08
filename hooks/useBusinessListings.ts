import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUIStore } from '@/store/uiStore';
import { useChildStore } from '@/store/childStore';
import { computeMatchScore, sortByMatchScore } from '@/lib/matchScore';
import type { MatchedListing } from '@/types/app';

export function useBusinessListings() {
  const userCoords = useUIStore((s) => s.userCoords);
  const filters = useUIStore((s) => s.filters);
  const activeChild = useChildStore((s) => s.activeChild);
  const activeChildNeeds = useChildStore((s) => s.activeChildNeeds);

  return useQuery({
    queryKey: ['listings', userCoords, filters, activeChild?.id ?? null],
    queryFn: async (): Promise<MatchedListing[]> => {
      if (!userCoords) return [];

      const { data, error } = await supabase.rpc('search_listings_near', {
        user_lat: userCoords.latitude,
        user_lng: userCoords.longitude,
        radius_km: filters.radiusKm,
        p_service_type_ids:
          filters.serviceTypeIds.length > 0 ? filters.serviceTypeIds : undefined,
      });

      if (error) throw error;

      const listings = (data ?? []) as any[];
      const matched = listings.map((l) =>
        computeMatchScore(l, activeChildNeeds, filters.radiusKm),
      );

      return sortByMatchScore(matched);
    },
    enabled: !!userCoords,
  });
}

export function useBusinessDetail(listingId: string) {
  return useQuery({
    queryKey: ['listing-detail', listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_listings')
        .select(
          `
          *,
          photos:business_photos(*),
          services:business_services(*, service_type:service_types(*)),
          therapists(*, specializations:therapist_specializations(service_types(*)))
        `,
        )
        .eq('id', listingId)
        .single();
      if (error) throw error;
      return data;
    },
  });
}
