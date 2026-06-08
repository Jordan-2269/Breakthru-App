import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { ChildProfile } from '@/types/app';

export function useChildProfiles() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['child-profiles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at');
      if (error) throw error;
      return data as ChildProfile[];
    },
    enabled: !!user,
  });
}

export function useCreateChild() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (values: {
      name: string;
      date_of_birth?: string;
      autism_diagnosis?: string;
      diagnosis_date?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('child_profiles')
        .insert({ ...values, parent_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['child-profiles', user?.id] }),
  });
}

export function useUpdateChild() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<ChildProfile> & { id: string }) => {
      const { error } = await supabase.from('child_profiles').update(values).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['child-profiles', user?.id] }),
  });
}

export function useChildNeeds(childId: string | null) {
  return useQuery({
    queryKey: ['child-needs', childId],
    queryFn: async () => {
      if (!childId) return [];
      const { data, error } = await supabase
        .from('child_service_needs')
        .select('*, service_types(*)')
        .eq('child_id', childId);
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        service_type_id: row.service_type_id,
        service_name: row.service_types?.name ?? '',
        priority: row.priority as 1 | 2 | 3,
      }));
    },
    enabled: !!childId,
  });
}
