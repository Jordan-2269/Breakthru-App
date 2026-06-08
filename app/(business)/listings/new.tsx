import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import type { ServiceType } from '@/types/app';

type Step = 'info' | 'location' | 'services';

export default function NewListingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [step, setStep] = useState<Step>('info');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>('');

  const { data: serviceTypes } = useQuery({
    queryKey: ['service-types'],
    queryFn: async (): Promise<ServiceType[]> => {
      const { data } = await supabase.from('service_types').select('*').order('name');
      return data ?? [];
    },
  });

  function toggleService(id: string) {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Business name is required.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_listings')
        .insert({
          owner_id: user!.id,
          name: name.trim(),
          description: description || null,
          phone: phone || null,
          email: email || null,
          website_url: website || null,
          address_line1: address || null,
          address_city: city || null,
          address_state: state || null,
          address_zip: zip || null,
          price_range: (priceRange || null) as any,
          is_claimed: true,
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;

      if (selectedServices.length > 0) {
        await supabase.from('business_services').insert(
          selectedServices.map((id) => ({ listing_id: data.id, service_type_id: id })),
        );
      }
      qc.invalidateQueries({ queryKey: ['my-listings'] });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  const steps: Step[] = ['info', 'location', 'services'];
  const stepIndex = steps.indexOf(step);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-3 bg-surface border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-primary">← Back</Text>
        </TouchableOpacity>
        <Text className="text-base font-semibold text-text-primary flex-1">Create Listing</Text>
        <View className="flex-row gap-1.5">
          {steps.map((s, i) => (
            <View key={s} className={`w-2 h-2 rounded-full ${i <= stepIndex ? 'bg-primary' : 'bg-gray-300'}`} />
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        {step === 'info' && (
          <View>
            <Text className="text-xl font-bold text-text-primary mb-6">Business Info</Text>
            <Input label="Business Name *" value={name} onChangeText={setName} placeholder="Sunshine ABA Therapy" />
            <Input label="Description" value={description} onChangeText={setDescription} placeholder="Tell families about your services..." multiline />
            <Input label="Phone" value={phone} onChangeText={setPhone} placeholder="+1 (555) 000-0000" keyboardType="phone-pad" />
            <Input label="Email" value={email} onChangeText={setEmail} placeholder="contact@yourpractice.com" keyboardType="email-address" autoCapitalize="none" />
            <Input label="Website" value={website} onChangeText={setWebsite} placeholder="https://yourpractice.com" keyboardType="url" autoCapitalize="none" />
            <Button label="Next →" onPress={() => setStep('location')} fullWidth disabled={!name.trim()} />
          </View>
        )}

        {step === 'location' && (
          <View>
            <Text className="text-xl font-bold text-text-primary mb-6">Location</Text>
            <Input label="Street Address" value={address} onChangeText={setAddress} placeholder="123 Main St" />
            <Input label="City" value={city} onChangeText={setCity} placeholder="Los Angeles" />
            <Input label="State" value={state} onChangeText={setState} placeholder="CA" maxLength={2} />
            <Input label="ZIP Code" value={zip} onChangeText={setZip} placeholder="90001" keyboardType="numeric" />
            <View className="flex-row gap-3 mt-2">
              <Button label="← Back" onPress={() => setStep('info')} variant="outlined" />
              <View className="flex-1">
                <Button label="Next →" onPress={() => setStep('services')} fullWidth />
              </View>
            </View>
          </View>
        )}

        {step === 'services' && (
          <View>
            <Text className="text-xl font-bold text-text-primary mb-2">Services & Pricing</Text>
            <Text className="text-sm text-text-secondary mb-4">Select all services you provide</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {serviceTypes?.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => toggleService(s.id)}
                  className={`border-2 rounded-full px-3 py-1.5 ${
                    selectedServices.includes(s.id) ? 'border-primary bg-primary-light' : 'border-border bg-surface'
                  }`}
                >
                  <Text className={`text-sm ${selectedServices.includes(s.id) ? 'text-primary font-medium' : 'text-text-primary'}`}>
                    {s.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text className="text-sm font-medium text-text-primary mb-3">Price Range</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {['$', '$$', '$$$', 'insurance'].map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPriceRange(priceRange === p ? '' : p)}
                  className={`border-2 rounded-full px-4 py-2 ${priceRange === p ? 'border-primary bg-primary-light' : 'border-border bg-surface'}`}
                >
                  <Text className={`text-sm ${priceRange === p ? 'text-primary font-medium' : 'text-text-primary'}`}>
                    {p === 'insurance' ? 'Insurance' : p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="flex-row gap-3 pb-8">
              <Button label="← Back" onPress={() => setStep('location')} variant="outlined" />
              <View className="flex-1">
                <Button label="Save Listing" onPress={handleSave} loading={loading} fullWidth />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
