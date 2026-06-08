import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useUpdateChild } from '@/hooks/useChildProfiles';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AUTISM_DIAGNOSES } from '@/lib/constants';
import type { ChildProfile, ServiceType } from '@/types/app';

export default function EditChildScreen() {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const router = useRouter();
  const { mutateAsync: updateChild, isPending } = useUpdateChild();

  const { data: child } = useQuery({
    queryKey: ['child-detail', childId],
    queryFn: async (): Promise<ChildProfile | null> => {
      const { data } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('id', childId)
        .single();
      return data;
    },
  });

  const [name, setName] = useState(child?.name ?? '');
  const [dob, setDob] = useState(child?.date_of_birth ?? '');
  const [diagnosis, setDiagnosis] = useState(child?.autism_diagnosis ?? '');
  const [notes, setNotes] = useState(child?.notes ?? '');

  const { data: serviceTypes } = useQuery({
    queryKey: ['service-types'],
    queryFn: async (): Promise<ServiceType[]> => {
      const { data } = await supabase.from('service_types').select('*').order('category');
      return data ?? [];
    },
  });

  const { data: existingNeeds } = useQuery({
    queryKey: ['child-needs', childId],
    queryFn: async () => {
      const { data } = await supabase
        .from('child_service_needs')
        .select('service_type_id')
        .eq('child_id', childId);
      return (data ?? []).map((r: any) => r.service_type_id as string);
    },
  });

  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(existingNeeds ?? []);

  function toggleNeed(id: string) {
    setSelectedNeeds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Name is required.');
      return;
    }
    try {
      await updateChild({
        id: childId,
        name: name.trim(),
        date_of_birth: dob || null,
        autism_diagnosis: diagnosis || null,
        notes: notes || null,
      } as any);
      await supabase.from('child_service_needs').delete().eq('child_id', childId);
      if (selectedNeeds.length > 0) {
        await supabase.from('child_service_needs').insert(
          selectedNeeds.map((id) => ({ child_id: childId, service_type_id: id, priority: 2 })),
        );
      }
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-3 bg-surface border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-primary">← Back</Text>
        </TouchableOpacity>
        <Text className="text-base font-semibold text-text-primary">Edit Child Profile</Text>
      </View>
      <ScrollView className="flex-1 px-4 pt-6">
        <Input label="Name *" value={name} onChangeText={setName} placeholder="Child's name" />
        <Input label="Date of Birth" value={dob} onChangeText={setDob} placeholder="YYYY-MM-DD" />
        <Text className="text-sm font-medium text-text-primary mb-3">Diagnosis</Text>
        <View className="gap-2 mb-4">
          {AUTISM_DIAGNOSES.map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => setDiagnosis(diagnosis === d ? '' : d)}
              className={`border-2 rounded-xl px-4 py-3 ${
                diagnosis === d ? 'border-primary bg-primary-light' : 'border-border bg-surface'
              }`}
            >
              <Text className={`text-sm ${diagnosis === d ? 'text-primary font-medium' : 'text-text-primary'}`}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text className="text-sm font-medium text-text-primary mb-3">Service Needs</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {serviceTypes?.map((s) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => toggleNeed(s.id)}
              className={`border-2 rounded-full px-3 py-1.5 ${
                selectedNeeds.includes(s.id) ? 'border-primary bg-primary-light' : 'border-border bg-surface'
              }`}
            >
              <Text className={`text-sm ${selectedNeeds.includes(s.id) ? 'text-primary font-medium' : 'text-text-primary'}`}>
                {s.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button label="Save Changes" onPress={handleSave} loading={isPending} fullWidth />
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
