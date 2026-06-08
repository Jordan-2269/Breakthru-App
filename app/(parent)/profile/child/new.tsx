import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateChild } from '@/hooks/useChildProfiles';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { AUTISM_DIAGNOSES } from '@/lib/constants';
import type { ServiceType } from '@/types/app';

type Step = 'info' | 'diagnosis' | 'needs';

export default function NewChildScreen() {
  const router = useRouter();
  const { mutateAsync: createChild, isPending } = useCreateChild();
  const [step, setStep] = useState<Step>('info');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const { data: serviceTypes } = useQuery({
    queryKey: ['service-types'],
    queryFn: async (): Promise<ServiceType[]> => {
      const { data, error } = await supabase.from('service_types').select('*').order('category');
      if (error) throw error;
      return data ?? [];
    },
  });

  function toggleNeed(id: string) {
    setSelectedNeeds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSave() {
    setErrorMsg('');
    try {
      const child = await createChild({
        name: name.trim(),
        date_of_birth: dob || undefined,
        autism_diagnosis: diagnosis || undefined,
      });
      if (selectedNeeds.length > 0) {
        const { error } = await supabase.from('child_service_needs').insert(
          selectedNeeds.map((id) => ({
            child_id: child.id,
            service_type_id: id,
            priority: 2,
          })),
        );
        if (error) throw error;
      }
      router.replace('/(parent)/profile');
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Something went wrong. Please try again.');
    }
  }

  const steps: Step[] = ['info', 'diagnosis', 'needs'];
  const stepIndex = steps.indexOf(step);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F2EE' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8E8E8' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Text style={{ color: '#0A66C2', fontSize: 15 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#191919', flex: 1 }}>Add Child Profile</Text>
        {/* Step dots */}
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {steps.map((s, i) => (
            <View key={s} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i <= stepIndex ? '#0A66C2' : '#D0D0D0' }} />
          ))}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>

        {/* ── Step 1: Info ── */}
        {step === 'info' && (
          <View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#191919', marginBottom: 4 }}>About the child</Text>
            <Text style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>Basic information</Text>
            <Input label="Child's Name *" value={name} onChangeText={setName} placeholder="Alex" />
            <Input
              label="Date of Birth (optional)"
              value={dob}
              onChangeText={setDob}
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
            />
            <TouchableOpacity
              onPress={() => setStep('diagnosis')}
              disabled={!name.trim()}
              style={{ backgroundColor: name.trim() ? '#0A66C2' : '#C0C0C0', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8 }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>Next →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Step 2: Diagnosis ── */}
        {step === 'diagnosis' && (
          <View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#191919', marginBottom: 4 }}>Diagnosis</Text>
            <Text style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>Select the diagnosis if known (optional)</Text>
            <View style={{ gap: 8, marginBottom: 24 }}>
              {AUTISM_DIAGNOSES.map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setDiagnosis(diagnosis === d ? '' : d)}
                  style={{ borderWidth: 2, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderColor: diagnosis === d ? '#0A66C2' : '#E0E0E0', backgroundColor: diagnosis === d ? '#EAF0F9' : '#FFFFFF' }}
                >
                  <Text style={{ fontSize: 14, color: diagnosis === d ? '#0A66C2' : '#191919', fontWeight: diagnosis === d ? '600' : '400' }}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => setStep('info')} style={{ flex: 1, borderWidth: 1, borderColor: '#0A66C2', borderRadius: 10, paddingVertical: 14, alignItems: 'center' }}>
                <Text style={{ color: '#0A66C2', fontWeight: '600' }}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStep('needs')} style={{ flex: 2, backgroundColor: '#0A66C2', borderRadius: 10, paddingVertical: 14, alignItems: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>Next →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Step 3: Service Needs ── */}
        {step === 'needs' && (
          <View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#191919', marginBottom: 4 }}>Service Needs</Text>
            <Text style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>
              Select the therapies your child needs. We'll use this to rank businesses.
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {serviceTypes?.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => toggleNeed(s.id)}
                  style={{ borderWidth: 2, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderColor: selectedNeeds.includes(s.id) ? '#0A66C2' : '#D0D0D0', backgroundColor: selectedNeeds.includes(s.id) ? '#EAF0F9' : '#FFFFFF' }}
                >
                  <Text style={{ fontSize: 13, color: selectedNeeds.includes(s.id) ? '#0A66C2' : '#444', fontWeight: selectedNeeds.includes(s.id) ? '700' : '400' }}>
                    {s.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Error message */}
            {errorMsg !== '' && (
              <View style={{ backgroundColor: '#FFF0F0', borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#FFCCCC' }}>
                <Text style={{ color: '#CC0000', fontSize: 13 }}>{errorMsg}</Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 40 }}>
              <TouchableOpacity onPress={() => setStep('diagnosis')} style={{ flex: 1, borderWidth: 1, borderColor: '#0A66C2', borderRadius: 10, paddingVertical: 14, alignItems: 'center' }}>
                <Text style={{ color: '#0A66C2', fontWeight: '600' }}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={isPending}
                style={{ flex: 2, backgroundColor: '#0A66C2', borderRadius: 10, paddingVertical: 14, alignItems: 'center' }}
              >
                {isPending
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>Save Profile</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
