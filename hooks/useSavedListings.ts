import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export function useSavedListingIds() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['saved-ids', user?.id],
    queryFn: async (): Promise<Set<string>> => {
      if (!user) return new Set();
      const { data } = await supabase
        .from('saved_listings')
        .select('listing_id')
        .eq('parent_id', user.id);
      return new Set((data ?? []).map((r: any) => r.listing_id));
    },
    enabled: !!user,
  });
}

export function useToggleSaveListing() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ listingId, isSaved }: { listingId: string; isSaved: boolean }) => {
      if (!user) return;
      if (isSaved) {
        const { error } = await supabase
          .from('saved_listings')
          .delete()
          .eq('parent_id', user.id)
          .eq('listing_id', listingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('saved_listings')
          .insert({ parent_id: user.id, listing_id: listingId });
        if (error) throw error;
      }
    },
    onMutate: async ({ listingId, isSaved }) => {
      await qc.cancelQueries({ queryKey: ['saved-ids', user?.id] });
      const prev = qc.getQueryData<Set<string>>(['saved-ids', user?.id]);
      qc.setQueryData<Set<string>>(['saved-ids', user?.id], (old) => {
        const next = new Set(old ?? []);
        if (isSaved) next.delete(listingId);
        else next.add(listingId);
        return next;
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['saved-ids', user?.id], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['saved-ids', user?.id] });
      qc.invalidateQueries({ queryKey: ['saved-listings', user?.id] });
    },
  });
}
