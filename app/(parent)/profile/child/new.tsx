import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateChild } from '@/hooks/useChildProfiles';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
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
    if (!name.trim()) {
      Alert.alert('Please enter the child\'s name.');
      return;
    }
    try {
      const child = await createChild({
        name: name.trim(),
        date_of_birth: dob || undefined,
        autism_diagnosis: diagnosis || undefined,
      });
      if (selectedNeeds.length > 0) {
        await supabase.from('child_service_needs').insert(
          selectedNeeds.map((id) => ({
            child_id: child.id,
            service_type_id: id,
            priority: 2,
          })),
        );
      }
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  }

  const steps: Step[] = ['info', 'diagnosis', 'needs'];
  const stepIndex = steps.indexOf(step);

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-surface border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-primary">← Back</Text>
        </TouchableOpacity>
        <Text className="text-base font-semibold text-text-primary flex-1">Add Child Profile</Text>
        {/* Step indicator */}
        <View className="flex-row gap-1.5">
          {steps.map((s, i) => (
            <View
              key={s}
              className={`w-2 h-2 rounded-full ${i <= stepIndex ? 'bg-primary' : 'bg-gray-300'}`}
            />
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        {step === 'info' && (
          <View>
            <Text className="text-xl font-bold text-text-primary mb-1">About the child</Text>
            <Text className="text-sm text-text-secondary mb-6">Basic information</Text>
            <Input label="Child's Name *" value={name} onChangeText={setName} placeholder="Alex" />
            <Input
              label="Date of Birth"
              value={dob}
              onChangeText={setDob}
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
            />
            <Button
              label="Next →"
              onPress={() => setStep('diagnosis')}
              fullWidth
              disabled={!name.trim()}
            />
          </View>
        )}

        {step === 'diagnosis' && (
          <View>
            <Text className="text-xl font-bold text-text-primary mb-1">Diagnosis</Text>
            <Text className="text-sm text-text-secondary mb-6">Select the diagnosis if known</Text>
            <View className="gap-2 mb-6">
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
            <View className="flex-row gap-3">
              <Button label="← Back" onPress={() => setStep('info')} variant="outlined" />
              <View className="flex-1">
                <Button label="Next →" onPress={() => setStep('needs')} fullWidth />
              </View>
            </View>
          </View>
        )}

        {step === 'needs' && (
          <View>
            <Text className="text-xl font-bold text-text-primary mb-1">Service Needs</Text>
            <Text className="text-sm text-text-secondary mb-6">
              Select the therapies your child needs. We'll use this to match services.
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {serviceTypes?.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => toggleNeed(s.id)}
                  className={`border-2 rounded-full px-3 py-1.5 ${
                    selectedNeeds.includes(s.id)
                      ? 'border-primary bg-primary-light'
                      : 'border-border bg-surface'
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      selectedNeeds.includes(s.id) ? 'text-primary font-medium' : 'text-text-primary'
                    }`}
                  >
                    {s.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="flex-row gap-3 pb-8">
              <Button label="← Back" onPress={() => setStep('diagnosis')} variant="outlined" />
              <View className="flex-1">
                <Button label="Save Profile" onPress={handleSave} loading={isPending} fullWidth />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
