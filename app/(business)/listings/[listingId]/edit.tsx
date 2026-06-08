import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function EditListingScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: listing } = useQuery({
    queryKey: ['listing-edit', listingId],
    queryFn: async () => {
      const { data } = await supabase.from('business_listings').select('*').eq('id', listingId).single();
      return data;
    },
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  useEffect(() => {
    if (listing) {
      setName(listing.name ?? '');
      setDescription(listing.description ?? '');
      setPhone(listing.phone ?? '');
      setEmail(listing.email ?? '');
      setWebsite(listing.website_url ?? '');
      setAddress(listing.address_line1 ?? '');
      setCity(listing.address_city ?? '');
      setState(listing.address_state ?? '');
      setZip(listing.address_zip ?? '');
    }
  }, [listing]);

  async function handleSave() {
    setLoading(true);
    try {
      const { error } = await supabase.from('business_listings').update({
        name, description: description || null, phone: phone || null,
        email: email || null, website_url: website || null,
        address_line1: address || null, address_city: city || null,
        address_state: state || null, address_zip: zip || null,
      }).eq('id', listingId);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ['my-listings'] });
      qc.invalidateQueries({ queryKey: ['listing-detail', listingId] });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-3 bg-surface border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-primary">← Back</Text>
        </TouchableOpacity>
        <Text className="text-base font-semibold text-text-primary">Edit Listing</Text>
      </View>
      <ScrollView className="flex-1 px-4 pt-6">
        <Input label="Business Name *" value={name} onChangeText={setName} placeholder="Business name" />
        <Input label="Description" value={description} onChangeText={setDescription} placeholder="About your practice..." multiline />
        <Input label="Phone" value={phone} onChangeText={setPhone} placeholder="+1 (555) 000-0000" keyboardType="phone-pad" />
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="contact@yourpractice.com" keyboardType="email-address" autoCapitalize="none" />
        <Input label="Website" value={website} onChangeText={setWebsite} placeholder="https://" keyboardType="url" autoCapitalize="none" />
        <Input label="Street Address" value={address} onChangeText={setAddress} placeholder="123 Main St" />
        <Input label="City" value={city} onChangeText={setCity} placeholder="Los Angeles" />
        <Input label="State" value={state} onChangeText={setState} placeholder="CA" maxLength={2} />
        <Input label="ZIP" value={zip} onChangeText={setZip} placeholder="90001" keyboardType="numeric" />
        <Button label="Save Changes" onPress={handleSave} loading={loading} fullWidth />
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
