import React, { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import type { MatchedListing } from '@/types/app';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

type Coords = { latitude: number; longitude: number };

type Props = {
  userCoords: Coords;
  listings: MatchedListing[];
  onSelectListing: (listing: MatchedListing | null) => void;
  selectedListing: MatchedListing | null;
  fullScreen?: boolean;
};

export function MapSection({ userCoords, listings, onSelectListing, selectedListing, fullScreen = false }: Props) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const mappable = listings.filter((l) => l.latitude && l.longitude);
  const mapHeight = fullScreen ? '100%' : 280;

  if (!isLoaded) {
    return (
      <View
        style={{
          height: fullScreen ? undefined : 280,
          flex: fullScreen ? 1 : undefined,
          backgroundColor: '#EAF0F9',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color="#0A66C2" />
        <Text style={{ color: '#666', marginTop: 8, fontSize: 13 }}>Loading map...</Text>
      </View>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: mapHeight }}
      center={{ lat: userCoords.latitude, lng: userCoords.longitude }}
      zoom={11}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        ],
      }}
      onClick={() => onSelectListing(null)}
    >
      {/* User location dot */}
      <Marker
        position={{ lat: userCoords.latitude, lng: userCoords.longitude }}
        title="You are here"
        icon={{
          path: 'M 0 0 m -6 0 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0',
          fillColor: '#0A66C2',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          scale: 1.5,
        }}
      />

      {/* Business markers */}
      {mappable.map((listing) => (
        <Marker
          key={listing.id}
          position={{ lat: listing.latitude!, lng: listing.longitude! }}
          title={listing.name}
          icon={{
            path: 'M 0 0 m -8 0 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0',
            fillColor:
              listing.matchScore >= 70
                ? '#10AC84'
                : listing.matchScore >= 50
                ? '#0A66C2'
                : '#E07B00',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: 1.2,
          }}
          onClick={() => onSelectListing(listing)}
        />
      ))}

      {/* Info window for selected marker */}
      {selectedListing?.latitude && selectedListing?.longitude && (
        <InfoWindow
          position={{ lat: selectedListing.latitude, lng: selectedListing.longitude }}
          onCloseClick={() => onSelectListing(null)}
        >
          <div style={{ maxWidth: 200, fontFamily: 'sans-serif' }}>
            <p style={{ fontWeight: 700, margin: '0 0 4px', fontSize: 14, color: '#191919' }}>
              {selectedListing.name}
            </p>
            <p style={{ margin: '0 0 2px', fontSize: 12, color: '#666' }}>
              {[selectedListing.address_city, selectedListing.address_state]
                .filter(Boolean)
                .join(', ')}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#0A66C2', fontWeight: 600 }}>
              ⭐ {selectedListing.avg_rating.toFixed(1)} ·{' '}
              {selectedListing.distance_km < 1
                ? '<1 km away'
                : `${selectedListing.distance_km.toFixed(1)} km away`}
            </p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
