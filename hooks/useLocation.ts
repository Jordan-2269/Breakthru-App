import { useEffect } from 'react';
import * as Location from 'expo-location';
import { useUIStore } from '@/store/uiStore';

export function useLocation() {
  const setUserCoords = useUIStore((s) => s.setUserCoords);
  const userCoords = useUIStore((s) => s.userCoords);

  useEffect(() => {
    async function requestLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserCoords({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    }
    if (!userCoords) requestLocation();
  }, []);

  return userCoords;
}
