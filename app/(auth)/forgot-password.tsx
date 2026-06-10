import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleReset() {
    setErrorMsg('');
    if (!email.trim()) {
      setErrorMsg('Please enter your email.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background px-6">
      <TouchableOpacity onPress={() => router.back()} className="mt-4 mb-8">
        <Text className="text-primary text-base">← Back</Text>
      </TouchableOpacity>

      <Text className="text-3xl font-bold text-text-primary mb-2">Reset Password</Text>
      <Text className="text-text-secondary mb-8">
        Enter your email and we'll send you a link to reset your password.
      </Text>

      {sent ? (
        <View className="bg-green-50 border border-green-200 rounded-xl p-4">
          <Text className="text-success font-semibold">Email sent!</Text>
          <Text className="text-sm text-text-secondary mt-1">
            Check your inbox for a password reset link.
          </Text>
        </View>
      ) : (
        <>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errorMsg !== '' && (
            <View style={{ backgroundColor: '#FFF0F0', borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#FFCCCC' }}>
              <Text style={{ color: '#CC0000', fontSize: 13 }}>{errorMsg}</Text>
            </View>
          )}
          <Button label="Send Reset Link" onPress={handleReset} loading={loading} fullWidth />
        </>
      )}
    </SafeAreaView>
  );
}
