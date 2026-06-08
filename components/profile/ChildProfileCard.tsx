import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { supabase } from '@/lib/supabase';
import type { ChildProfile, ChildNeed } from '@/types/app';
import { useChildStore } from '@/store/childStore';

type Props = {
  child: ChildProfile;
  isActive?: boolean;
  needsCount?: number;
};

export function ChildProfileCard({ child, isActive, needsCount }: Props) {
  const router = useRouter();
  const setActiveChild = useChildStore((s) => s.setActiveChild);
  const setActiveChildNeeds = useChildStore((s) => s.setActiveChildNeeds);

  function calcAge(dob: string | null) {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  async function activateChild() {
    setActiveChild(child);
    const { data } = await supabase
      .from('child_service_needs')
      .select('service_type_id, priority, service_types(name)')
      .eq('child_id', child.id);
    const needs: ChildNeed[] = (data ?? []).map((row: any) => ({
      service_type_id: row.service_type_id,
      service_name: row.service_types?.name ?? '',
      priority: row.priority as 1 | 2 | 3,
    }));
    setActiveChildNeeds(needs);
  }

  const age = calcAge(child.date_of_birth);

  return (
    <Card className={`mb-3 ${isActive ? 'border-primary border-2' : ''}`}>
      <View className="flex-row items-center">
        <Avatar name={child.name} size="md" />
        <View className="flex-1 ml-3">
          <Text className="text-base font-semibold text-text-primary">{child.name}</Text>
          <Text className="text-sm text-text-secondary">
            {age != null ? `Age ${age}` : ''}
            {age != null && child.autism_diagnosis ? ' · ' : ''}
            {child.autism_diagnosis ?? ''}
          </Text>
          {needsCount != null && (
            <Text className="text-xs text-text-tertiary mt-0.5">
              {needsCount} service need{needsCount !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <View className="gap-2">
          <TouchableOpacity
            onPress={activateChild}
            className={`border rounded-full px-3 py-1 ${isActive ? 'bg-primary border-primary' : 'border-primary'}`}
          >
            <Text className={`text-xs font-medium ${isActive ? 'text-white' : 'text-primary'}`}>
              {isActive ? 'Active' : 'Set Active'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`/(parent)/profile/child/${child.id}`)}
            className="border border-border rounded-full px-3 py-1"
          >
            <Text className="text-xs text-text-secondary">Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}
