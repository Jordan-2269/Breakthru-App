import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('Sign In Failed', error.message);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} className="mt-4 mb-8">
          <Text className="text-primary text-base">← Back</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-text-primary mb-2">Sign In</Text>
        <Text className="text-text-secondary mb-8">Welcome back to Breakthru</Text>

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry={!showPassword}
          rightIcon={
            <Text className="text-primary text-sm">{showPassword ? 'Hide' : 'Show'}</Text>
          }
          onRightIconPress={() => setShowPassword((v) => !v)}
        />

        <TouchableOpacity
          onPress={() => router.push('/(auth)/forgot-password')}
          className="mb-6 self-end"
        >
          <Text className="text-primary text-sm">Forgot password?</Text>
        </TouchableOpacity>

        <Button label="Sign In" onPress={handleSignIn} loading={loading} fullWidth size="lg" />

        <View className="flex-row justify-center mt-8">
          <Text className="text-text-secondary text-sm">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
            <Text className="text-primary text-sm font-medium">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
