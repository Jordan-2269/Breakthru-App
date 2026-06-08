import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

export function useUpdateListingPhoto(listingId: string) {
  const [isUploading, setIsUploading] = useState(false);
  const qc = useQueryClient();

  async function pickAndUpload(type: 'cover' | 'logo') {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'logo' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;

    setIsUploading(true);
    try {
      const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
      const path = `${listingId}/${type}-${Date.now()}.${ext}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('listing-photos')
        .upload(path, blob, { upsert: true, contentType });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('listing-photos')
        .getPublicUrl(path);

      const field = type === 'cover' ? 'cover_image_url' : 'logo_url';
      const { error: updateError } = await supabase
        .from('business_listings')
        .update({ [field]: publicUrl })
        .eq('id', listingId);
      if (updateError) throw updateError;

      qc.invalidateQueries({ queryKey: ['listing-edit', listingId] });
      qc.invalidateQueries({ queryKey: ['listing-detail', listingId] });
      qc.invalidateQueries({ queryKey: ['my-listings'] });
    } finally {
      setIsUploading(false);
    }
  }

  return { pickAndUpload, isUploading };
}
