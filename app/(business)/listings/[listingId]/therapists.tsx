import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { StarRating } from '@/components/ui/StarRating';
import type { ServiceType } from '@/types/app';

export default function TherapistsScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tName, setTName] = useState('');
  const [tTitle, setTTitle] = useState('');
  const [tBio, setTBio] = useState('');
  const [tYears, setTYears] = useState('');

  const { data: therapists } = useQuery({
    queryKey: ['therapists', listingId],
    queryFn: async () => {
      const { data } = await supabase.from('therapists').select('*').eq('listing_id', listingId).order('created_at');
      return data ?? [];
    },
  });

  const { data: serviceTypes } = useQuery({
    queryKey: ['service-types'],
    queryFn: async (): Promise<ServiceType[]> => {
      const { data } = await supabase.from('service_types').select('*').order('name');
      return data ?? [];
    },
  });

  const saveTherapist = useMutation({
    mutationFn: async () => {
      if (!tName.trim()) throw new Error('Name is required');
      if (editingId) {
        const { error } = await supabase.from('therapists').update({
          name: tName, title: tTitle || null, bio: tBio || null,
          years_experience: tYears ? parseInt(tYears) : null,
        }).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('therapists').insert({
          listing_id: listingId, name: tName, title: tTitle || null,
          bio: tBio || null, years_experience: tYears ? parseInt(tYears) : null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['therapists', listingId] });
      closeModal();
    },
    onError: (e: any) => Alert.alert('Error', e.message),
  });

  const deleteTherapist = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('therapists').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['therapists', listingId] }),
  });

  function openNew() {
    setEditingId(null);
    setTName('');
    setTTitle('');
    setTBio('');
    setTYears('');
    setShowModal(true);
  }

  function openEdit(t: any) {
    setEditingId(t.id);
    setTName(t.name);
    setTTitle(t.title ?? '');
    setTBio(t.bio ?? '');
    setTYears(t.years_experience?.toString() ?? '');
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
  }

  function confirmDelete(id: string) {
    Alert.alert('Delete Therapist', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTherapist.mutate(id) },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 py-3 bg-surface border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-primary">← Back</Text>
        </TouchableOpacity>
        <Text className="text-base font-semibold text-text-primary flex-1">Therapists</Text>
        <TouchableOpacity onPress={openNew} className="bg-primary rounded-full px-4 py-1.5">
          <Text className="text-white text-sm font-medium">+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={therapists}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }: { item: any }) => (
          <View className="bg-surface border border-border rounded-xl p-4 mb-3 flex-row items-center">
            <Avatar name={item.name} uri={item.avatar_url} size="md" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-text-primary">{item.name}</Text>
              {item.title && <Text className="text-xs text-text-secondary">{item.title}</Text>}
              {item.years_experience != null && (
                <Text className="text-xs text-text-tertiary">{item.years_experience} yrs exp</Text>
              )}
            </View>
            <View className="gap-2">
              <TouchableOpacity onPress={() => openEdit(item)} className="border border-primary rounded-full px-3 py-1">
                <Text className="text-primary text-xs">Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDelete(item.id)} className="border border-warning rounded-full px-3 py-1">
                <Text className="text-warning text-xs">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-3xl mb-2">👩‍⚕️</Text>
            <Text className="text-sm font-semibold text-text-primary">No therapists yet</Text>
            <Text className="text-xs text-text-secondary text-center mt-1">
              Add therapist profiles so families can learn about your team.
            </Text>
          </View>
        }
      />

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="formSheet">
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-surface">
            <Text className="text-base font-semibold text-text-primary">
              {editingId ? 'Edit Therapist' : 'Add Therapist'}
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <Text className="text-primary">Cancel</Text>
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1 px-4 pt-6">
            <Input label="Name *" value={tName} onChangeText={setTName} placeholder="Dr. Jane Smith" />
            <Input label="Title / Credentials" value={tTitle} onChangeText={setTTitle} placeholder="BCBA, MA" />
            <Input label="Bio" value={tBio} onChangeText={setTBio} placeholder="Brief bio..." multiline />
            <Input label="Years of Experience" value={tYears} onChangeText={setTYears} placeholder="5" keyboardType="numeric" />
            <Button label="Save" onPress={() => saveTherapist.mutate()} loading={saveTherapist.isPending} fullWidth />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
