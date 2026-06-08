import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ChildProfile, ChildNeed } from '@/types/app';
import { useChildStore } from '@/store/childStore';

type Props = {
  child: ChildProfile;
  isActive?: boolean;
};

export function ChildProfileCard({ child, isActive }: Props) {
  const router = useRouter();
  const setActiveChild = useChildStore((s) => s.setActiveChild);
  const setActiveChildNeeds = useChildStore((s) => s.setActiveChildNeeds);

  const { data: needs } = useQuery({
    queryKey: ['child-needs', child.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('child_service_needs')
        .select('service_type_id, priority, service_types(name)')
        .eq('child_id', child.id);
      return (data ?? []).map((row: any) => ({
        service_type_id: row.service_type_id,
        service_name: row.service_types?.name ?? '',
        priority: row.priority as 1 | 2 | 3,
      })) as ChildNeed[];
    },
  });

  function calcAge(dob: string | null) {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  async function activateChild() {
    setActiveChild(child);
    setActiveChildNeeds(needs ?? []);
  }

  const age = calcAge(child.date_of_birth);

  return (
    <View style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 14,
      borderWidth: isActive ? 2 : 1,
      borderColor: isActive ? '#0A66C2' : '#E8E8E8',
      marginBottom: 12,
      padding: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    }}>
      {/* Top row: avatar + name + buttons */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Avatar */}
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#0A66C2', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 18 }}>
            {child.name[0].toUpperCase()}
          </Text>
        </View>

        {/* Name + info */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#191919' }}>{child.name}</Text>
          <Text style={{ fontSize: 13, color: '#777', marginTop: 2 }}>
            {[age != null ? `Age ${age}` : null, child.autism_diagnosis].filter(Boolean).join(' · ')}
          </Text>
          {isActive && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#0D9E5C' }} />
              <Text style={{ fontSize: 11, color: '#0D9E5C', fontWeight: '700' }}>Active — matching services to this child</Text>
            </View>
          )}
        </View>

        {/* Buttons */}
        <View style={{ gap: 6 }}>
          <TouchableOpacity
            onPress={activateChild}
            style={{
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 5,
              backgroundColor: isActive ? '#0A66C2' : 'transparent',
              borderWidth: 1,
              borderColor: '#0A66C2',
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: isActive ? '#FFFFFF' : '#0A66C2' }}>
              {isActive ? '✓ Active' : 'Set Active'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`/(parent)/profile/child/${child.id}`)}
            style={{ borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: '#D0D0D0' }}
          >
            <Text style={{ fontSize: 11, color: '#666', fontWeight: '600' }}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Service needs chips */}
      {needs && needs.length > 0 ? (
        <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {needs.map((n) => (
            <View
              key={n.service_type_id}
              style={{
                backgroundColor: isActive ? '#EAF0F9' : '#F5F5F5',
                borderRadius: 20,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: isActive ? '#C0D8F0' : '#E0E0E0',
              }}
            >
              <Text style={{ fontSize: 11, color: isActive ? '#0A66C2' : '#555', fontWeight: '600' }}>
                {n.service_name}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => router.push(`/(parent)/profile/child/${child.id}`)}
          style={{ marginTop: 10 }}
        >
          <Text style={{ fontSize: 12, color: '#999' }}>
            No service needs set · <Text style={{ color: '#0A66C2' }}>Add needs →</Text>
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
