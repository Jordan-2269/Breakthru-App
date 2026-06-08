import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export type Review = {
  id: string;
  reviewer_id: string;
  listing_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  reviewer: { display_name: string | null; avatar_url: string | null } | null;
};

export function useListingReviews(listingId: string) {
  return useQuery({
    queryKey: ['reviews', listingId],
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, reviewer:profiles!reviewer_id(display_name, avatar_url)')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Review[];
    },
  });
}

export function useMyReview(listingId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-review', listingId, user?.id],
    queryFn: async (): Promise<Review | null> => {
      if (!user) return null;
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('listing_id', listingId)
        .eq('reviewer_id', user.id)
        .maybeSingle();
      return data as Review | null;
    },
    enabled: !!user,
  });
}

export function useSubmitReview(listingId: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ rating, title, body }: { rating: number; title: string; body: string }) => {
      const existing = qc.getQueryData<Review | null>(['my-review', listingId, user?.id]);
      if (existing?.id) {
        const { error } = await supabase
          .from('reviews')
          .update({ rating, title: title || null, body: body || null })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('reviews').insert({
          reviewer_id: user!.id,
          listing_id: listingId,
          rating,
          title: title || null,
          body: body || null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', listingId] });
      qc.invalidateQueries({ queryKey: ['my-review', listingId, user?.id] });
      qc.invalidateQueries({ queryKey: ['listing-detail', listingId] });
    },
  });
}
