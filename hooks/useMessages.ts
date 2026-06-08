import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Message, Conversation, ConversationWithMeta } from '@/types/app';

export function useConversations() {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ['conversations', user?.id, role],
    queryFn: async (): Promise<ConversationWithMeta[]> => {
      if (!user) return [];

      let query = supabase
        .from('conversations')
        .select('*, listing:business_listings(name, logo_url)')
        .order('last_message_at', { ascending: false });

      if (role === 'parent') {
        query = query.eq('parent_id', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map((c: any) => ({
        ...c,
        listing: c.listing,
        last_message_preview: c.last_message,
      }));
    },
    enabled: !!user,
  });
}

export function useMessages(conversationId: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel(`conv:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          qc.setQueryData<Message[]>(['messages', conversationId], (old) => [
            ...(old ?? []),
            payload.new as Message,
          ]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return query;
}

export function useSendMessage(conversationId: string) {
  const qc = useQueryClient();
  const { user, role } = useAuth();

  return useMutation({
    mutationFn: async (body: string) => {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user!.id,
        sender_role: role!,
        body,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*, listing:business_listings(name, logo_url), parent:profiles!parent_id(display_name, avatar_url)')
        .eq('id', conversationId)
        .single();
      if (error) throw error;
      return data as Conversation & {
        listing: { name: string; logo_url: string | null };
        parent: { display_name: string | null; avatar_url: string | null } | null;
      };
    },
    enabled: !!conversationId,
  });
}

export function useMarkConversationRead(conversationId: string) {
  const { user, role } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user || !role || !conversationId) return;
    const field = role === 'parent' ? 'parent_unread_count' : 'business_unread_count';
    supabase
      .from('conversations')
      .update({ [field]: 0 })
      .eq('id', conversationId)
      .then(() => {
        qc.invalidateQueries({ queryKey: ['unread-count', user.id] });
        qc.invalidateQueries({ queryKey: ['conversations', user.id, role] });
      });
  }, [conversationId, user?.id, role]);
}

export function useUnreadCount() {
  const { user, role } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['unread-count', user?.id],
    queryFn: async (): Promise<number> => {
      if (!user || !role) return 0;
      const field = role === 'parent' ? 'parent_unread_count' : 'business_unread_count';
      const { data } = await supabase
        .from('conversations')
        .select(field)
        .gt(field, 0);
      return (data ?? []).reduce((sum: number, row: any) => sum + (row[field] ?? 0), 0);
    },
    enabled: !!user && !!role,
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`unread:${user.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations' }, () => {
        qc.invalidateQueries({ queryKey: ['unread-count', user.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  return query;
}

export function useOrCreateConversation() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listingId,
      childId,
    }: {
      listingId: string;
      childId?: string;
    }): Promise<Conversation> => {
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('parent_id', user!.id)
        .eq('listing_id', listingId)
        .maybeSingle();

      if (existing) return existing;

      const { data, error } = await supabase
        .from('conversations')
        .insert({ parent_id: user!.id, listing_id: listingId, child_id: childId ?? null })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations'] }),
  });
}
