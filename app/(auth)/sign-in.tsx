import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
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
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSignIn() {
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setErrorMsg(error.message);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} className="mt-4 mb-8">
          <Text className="text-primary text-base">← Back</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-text-primary mb-2">Sign In</Text>
        <Text className="text-text-secondary mb-8">Welcome back to Breakthru Autism Services</Text>

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

        {errorMsg !== '' && (
          <View style={{ backgroundColor: '#FFF0F0', borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#FFCCCC' }}>
            <Text style={{ color: '#CC0000', fontSize: 13 }}>{errorMsg}</Text>
          </View>
        )}

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
