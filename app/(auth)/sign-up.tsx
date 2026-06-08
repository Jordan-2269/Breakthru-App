import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

type Role = 'parent' | 'business';

export default function SignUpScreen() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('parent');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSignUp() {
    if (!displayName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role, display_name: displayName } },
    });
    setLoading(false);

    if (error) {
      Alert.alert('Sign Up Failed', error.message);
      return;
    }

    // If session exists immediately, email confirmation is disabled — navigate now
    if (data.session) {
      // Auth listener in _layout will handle redirect
      return;
    }

    // Otherwise email confirmation is required — show the check-email screen
    setCheckEmail(true);
  }

  if (checkEmail) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-8">
        <Text style={{ fontSize: 64, marginBottom: 16 }}>📬</Text>
        <Text className="text-2xl font-bold text-text-primary text-center mb-3">
          Check your email
        </Text>
        <Text className="text-sm text-text-secondary text-center leading-5 mb-8">
          We sent a confirmation link to{' '}
          <Text className="text-primary font-medium">{email}</Text>.{'\n'}
          Click it to activate your account, then sign in below.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/sign-in')}
          style={{
            backgroundColor: '#0A66C2',
            borderRadius: 50,
            paddingVertical: 14,
            paddingHorizontal: 40,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
            Go to Sign In
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
        <TouchableOpacity onPress={() => router.back()} className="mt-4 mb-8">
          <Text className="text-primary text-base">← Back</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-text-primary mb-2">Create Account</Text>
        <Text className="text-text-secondary mb-6">Join the Breakthru community</Text>

        {/* Role selector */}
        <Text className="text-sm font-medium text-text-primary mb-3">I am a...</Text>
        <View className="flex-row gap-3 mb-6">
          {(['parent', 'business'] as Role[]).map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRole(r)}
              className={`flex-1 border-2 rounded-xl p-4 items-center ${
                role === r ? 'border-primary bg-primary-light' : 'border-border bg-surface'
              }`}
            >
              <Text className="text-2xl mb-1">{r === 'parent' ? '👨‍👩‍👧' : '🏥'}</Text>
              <Text
                className={`text-sm font-semibold ${role === r ? 'text-primary' : 'text-text-primary'}`}
              >
                {r === 'parent' ? 'Parent / Guardian' : 'Service Provider'}
              </Text>
              <Text className="text-xs text-text-secondary text-center mt-1">
                {r === 'parent'
                  ? 'Find services for my child'
                  : 'List my clinic or practice'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label={role === 'parent' ? 'Your Name' : 'Business Name'}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder={role === 'parent' ? 'Jane Smith' : 'Sunshine ABA Therapy'}
        />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Min. 8 characters"
          secureTextEntry
        />

        <Button label="Create Account" onPress={handleSignUp} loading={loading} fullWidth size="lg" />

        <View className="flex-row justify-center mt-8 pb-8">
          <Text className="text-text-secondary text-sm">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
            <Text className="text-primary text-sm font-medium">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
