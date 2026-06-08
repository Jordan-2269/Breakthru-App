import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Text className="text-4xl mb-4">🔍</Text>
        <Text className="text-xl font-bold text-text-primary text-center">Page Not Found</Text>
        <Text className="text-sm text-text-secondary text-center mt-2">
          The page you're looking for doesn't exist.
        </Text>
        <Link href="/(auth)/welcome" className="mt-6">
          <Text className="text-primary font-medium">Go to Home →</Text>
        </Link>
      </View>
    </>
  );
}
