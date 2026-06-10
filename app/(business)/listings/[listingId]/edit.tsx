import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUpdateListingPhoto } from '@/hooks/useUpdateListingPhoto';
import type { ServiceType } from '@/types/app';

export default function EditListingScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { pickAndUpload, isUploading } = useUpdateListingPhoto(listingId);

  const { data: listing } = useQuery({
    queryKey: ['listing-edit', listingId],
    queryFn: async () => {
      const { data } = await supabase.from('business_listings').select('*').eq('id', listingId).single();
      return data;
    },
  });

  const { data: serviceTypes } = useQuery({
    queryKey: ['service-types'],
    queryFn: async (): Promise<ServiceType[]> => {
      const { data } = await supabase.from('service_types').select('*').order('name');
      return data ?? [];
    },
  });

  type ServicePrice = { price_from: string; price_to: string; price_unit: string };

  const { data: currentServices } = useQuery({
    queryKey: ['listing-services', listingId],
    queryFn: async (): Promise<{ id: string; price_from: number | null; price_to: number | null; price_unit: string }[]> => {
      const { data } = await supabase
        .from('business_services')
        .select('service_type_id, price_from, price_to, price_unit')
        .eq('listing_id', listingId);
      return (data ?? []).map((r: any) => ({
        id: r.service_type_id as string,
        price_from: r.price_from ?? null,
        price_to: r.price_to ?? null,
        price_unit: r.price_unit ?? 'session',
      }));
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
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [servicePrices, setServicePrices] = useState<Record<string, { price_from: string; price_to: string; price_unit: string }>>({});

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

  useEffect(() => {
    if (currentServices) {
      setSelectedServices(currentServices.map((s) => s.id));
      const prices: Record<string, { price_from: string; price_to: string; price_unit: string }> = {};
      currentServices.forEach((s) => {
        prices[s.id] = {
          price_from: s.price_from != null ? String(s.price_from) : '',
          price_to: s.price_to != null ? String(s.price_to) : '',
          price_unit: s.price_unit ?? 'session',
        };
      });
      setServicePrices(prices);
    }
  }, [currentServices]);

  function toggleService(id: string) {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSave() {
    setErrorMsg('');
    setLoading(true);
    try {
      const { error: listingError } = await supabase
        .from('business_listings')
        .update({
          name, description: description || null, phone: phone || null,
          email: email || null, website_url: website || null,
          address_line1: address || null, address_city: city || null,
          address_state: state || null, address_zip: zip || null,
        })
        .eq('id', listingId);
      if (listingError) throw listingError;

      // Replace services: delete all then re-insert selected with prices
      await supabase.from('business_services').delete().eq('listing_id', listingId);
      if (selectedServices.length > 0) {
        const { error: servicesError } = await supabase.from('business_services').insert(
          selectedServices.map((id) => {
            const p = servicePrices[id];
            return {
              listing_id: listingId,
              service_type_id: id,
              price_from: p?.price_from ? parseFloat(p.price_from) : null,
              price_to: p?.price_to ? parseFloat(p.price_to) : null,
              price_unit: p?.price_unit || 'session',
            };
          }),
        );
        if (servicesError) throw servicesError;
      }

      qc.invalidateQueries({ queryKey: ['my-listings'] });
      qc.invalidateQueries({ queryKey: ['listing-detail', listingId] });
      qc.invalidateQueries({ queryKey: ['listing-services', listingId] });
      qc.invalidateQueries({ queryKey: ['listings'] });
      router.back();
    } catch (e: any) {
      setErrorMsg(e.message);
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

        {/* Photos */}
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#191919', marginBottom: 10 }}>Photos</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          {/* Cover photo */}
          <TouchableOpacity
            onPress={() => pickAndUpload('cover')}
            style={{ flex: 2, height: 90, borderRadius: 10, overflow: 'hidden', backgroundColor: '#EAF0F9', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#C0D8F0', borderStyle: 'dashed' }}
          >
            {listing?.cover_image_url ? (
              <Image source={{ uri: listing.cover_image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <Text style={{ fontSize: 11, color: '#0A66C2', fontWeight: '600', textAlign: 'center', paddingHorizontal: 8 }}>
                {isUploading ? '↑ Uploading…' : '+ Cover Photo'}
              </Text>
            )}
            {listing?.cover_image_url && (
              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', paddingVertical: 4, alignItems: 'center' }}>
                <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '600' }}>Change Cover</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Logo */}
          <TouchableOpacity
            onPress={() => pickAndUpload('logo')}
            style={{ flex: 1, height: 90, borderRadius: 10, overflow: 'hidden', backgroundColor: '#EAF0F9', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#C0D8F0', borderStyle: 'dashed' }}
          >
            {listing?.logo_url ? (
              <Image source={{ uri: listing.logo_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <Text style={{ fontSize: 11, color: '#0A66C2', fontWeight: '600', textAlign: 'center', paddingHorizontal: 6 }}>
                + Logo
              </Text>
            )}
            {listing?.logo_url && (
              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', paddingVertical: 4, alignItems: 'center' }}>
                <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '600' }}>Change</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {isUploading && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <ActivityIndicator size="small" color="#0A66C2" />
            <Text style={{ fontSize: 13, color: '#0A66C2' }}>Uploading photo…</Text>
          </View>
        )}

        <Input label="Business Name *" value={name} onChangeText={setName} placeholder="Business name" />
        <Input label="Description" value={description} onChangeText={setDescription} placeholder="About your practice..." multiline />
        <Input label="Phone" value={phone} onChangeText={setPhone} placeholder="+1 (555) 000-0000" keyboardType="phone-pad" />
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="contact@yourpractice.com" keyboardType="email-address" autoCapitalize="none" />
        <Input label="Website" value={website} onChangeText={setWebsite} placeholder="https://" keyboardType="url" autoCapitalize="none" />
        <Input label="Street Address" value={address} onChangeText={setAddress} placeholder="123 Main St" />
        <Input label="City" value={city} onChangeText={setCity} placeholder="Los Angeles" />
        <Input label="State" value={state} onChangeText={setState} placeholder="CA" maxLength={2} />
        <Input label="ZIP" value={zip} onChangeText={setZip} placeholder="90001" keyboardType="numeric" />

        {/* Services */}
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#191919', marginTop: 4, marginBottom: 10 }}>
          Services Offered
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {serviceTypes?.map((s) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => toggleService(s.id)}
              style={{
                borderWidth: 2, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
                borderColor: selectedServices.includes(s.id) ? '#0A66C2' : '#D0D0D0',
                backgroundColor: selectedServices.includes(s.id) ? '#EAF0F9' : '#FFFFFF',
              }}
            >
              <Text style={{
                fontSize: 13,
                color: selectedServices.includes(s.id) ? '#0A66C2' : '#444',
                fontWeight: selectedServices.includes(s.id) ? '700' : '400',
              }}>
                {s.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price inputs for selected services */}
        {selectedServices.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>
              Pricing (optional — leave blank to hide prices)
            </Text>
            {selectedServices.map((id) => {
              const svc = serviceTypes?.find((s) => s.id === id);
              const p = servicePrices[id] ?? { price_from: '', price_to: '', price_unit: 'session' };
              return (
                <View key={id} style={{ backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', padding: 12, marginBottom: 10 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#191919', marginBottom: 8 }}>{svc?.name}</Text>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>From ($)</Text>
                      <TextInput
                        value={p.price_from}
                        onChangeText={(v) => setServicePrices((prev) => ({ ...prev, [id]: { ...p, price_from: v } }))}
                        placeholder="e.g. 100"
                        keyboardType="numeric"
                        style={{ borderWidth: 1, borderColor: '#D0D0D0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, outlineWidth: 0 } as any}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>To ($)</Text>
                      <TextInput
                        value={p.price_to}
                        onChangeText={(v) => setServicePrices((prev) => ({ ...prev, [id]: { ...p, price_to: v } }))}
                        placeholder="e.g. 150"
                        keyboardType="numeric"
                        style={{ borderWidth: 1, borderColor: '#D0D0D0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, outlineWidth: 0 } as any}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Per</Text>
                      <TextInput
                        value={p.price_unit}
                        onChangeText={(v) => setServicePrices((prev) => ({ ...prev, [id]: { ...p, price_unit: v } }))}
                        placeholder="session"
                        style={{ borderWidth: 1, borderColor: '#D0D0D0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, outlineWidth: 0 } as any}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {errorMsg !== '' && (
          <View style={{ backgroundColor: '#FFF0F0', borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#FFCCCC' }}>
            <Text style={{ color: '#CC0000', fontSize: 13 }}>{errorMsg}</Text>
          </View>
        )}

        <Button label="Save Changes" onPress={handleSave} loading={loading} fullWidth />
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
