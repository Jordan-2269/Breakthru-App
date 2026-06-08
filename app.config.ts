import type { ExpoConfig } from 'expo/config';

export default (): ExpoConfig => ({
  name: 'Breakthru',
  slug: 'breakthru-app',
  version: '1.0.0',
  scheme: 'breakthru',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-splash-screen',
      {
        image: './assets/icon.png',
        backgroundColor: '#0A66C2',
        imageWidth: 150,
      },
    ],
    'expo-status-bar',
    'expo-location',
  ],
  experiments: {
    typedRoutes: true,
  },
});
