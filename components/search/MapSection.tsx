import React from 'react';
import { Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import type { MatchedListing } from '@/types/app';

type Coords = { latitude: number; longitude: number };

type Props = {
  userCoords: Coords;
  listings: MatchedListing[];
  onSelectListing: (listing: MatchedListing | null) => void;
  selectedListing: MatchedListing | null;
  fullScreen?: boolean;
};

export function MapSection({ userCoords, listings, onSelectListing, fullScreen = false }: Props) {
  const mappable = listings.filter((l) => l.latitude && l.longitude);

  return (
    <MapView
      style={{ width: '100%', height: fullScreen ? '100%' : 280 }}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      initialRegion={{
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      }}
      showsUserLocation
      showsMyLocationButton
    >
      {mappable.map((listing) => (
        <Marker
          key={listing.id}
          coordinate={{ latitude: listing.latitude!, longitude: listing.longitude! }}
          title={listing.name}
          description={[listing.address_city, listing.address_state].filter(Boolean).join(', ')}
          pinColor={
            listing.matchScore >= 70
              ? '#10AC84'
              : listing.matchScore >= 50
              ? '#0A66C2'
              : '#E07B00'
          }
          onPress={() => onSelectListing(listing)}
        />
      ))}
    </MapView>
  );
}
