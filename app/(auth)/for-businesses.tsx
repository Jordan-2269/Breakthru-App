import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const BENEFITS = [
  {
    emoji: '🎯',
    color: '#1D9BF0',
    title: 'Get Found by Families',
    desc: 'Parents searching for ABA therapy, speech therapy, and more see your business first — sorted by location and match.',
  },
  {
    emoji: '💬',
    color: '#00BA7C',
    title: 'Direct Messaging',
    desc: 'Families message you directly through the app. No leads platform, no middleman — just real families ready to enroll.',
  },
  {
    emoji: '⭐',
    color: '#FF6B35',
    title: 'Build Your Reputation',
    desc: 'Collect verified reviews from real families. A strong rating puts you at the top of every local search.',
  },
  {
    emoji: '📋',
    color: '#805AD5',
    title: 'Showcase Your Services',
    desc: 'List every service you offer with pricing, therapist bios, photos, and your accepted insurance — all in one place.',
  },
];

const STEPS = [
  { n: '1', title: 'Create a free account', desc: 'Sign up as a business in under 2 minutes.' },
  { n: '2', title: 'Build your listing', desc: 'Add your services, photos, therapists, and pricing.' },
  { n: '3', title: 'Start connecting', desc: 'Families in your area discover and message you directly.' },
];

export default function ForBusinessesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>

        {/* Nav */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10 }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={{ fontSize: 15, color: '#1D9BF0', fontWeight: '600' }}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={{
          backgroundColor: '#0F0F0F',
          marginHorizontal: 16,
          borderRadius: 20,
          padding: 32,
          alignItems: 'center',
          marginBottom: 28,
        }}>
          <View style={{
            width: 68, height: 68, borderRadius: 18,
            backgroundColor: '#1D9BF0',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 18,
            shadowColor: '#1D9BF0',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.5,
            shadowRadius: 18,
            elevation: 10,
          }}>
            <Text style={{ fontSize: 34, fontWeight: '900', color: '#FFFFFF' }}>B</Text>
          </View>

          <Text style={{ fontSize: 11, fontWeight: '800', color: '#1D9BF0', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 10 }}>
            For ABA & Autism Service Providers
          </Text>

          <Text style={{ fontSize: 30, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', lineHeight: 36, letterSpacing: -0.5 }}>
            Reach families{'\n'}who need you most
          </Text>

          <Text style={{ fontSize: 15, color: '#AAAAAA', textAlign: 'center', lineHeight: 23, marginTop: 14, maxWidth: 280 }}>
            Breakthru connects autism service providers with local families actively searching for care.
          </Text>

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 28, marginTop: 26, paddingTop: 24, borderTopWidth: 1, borderTopColor: '#222222', width: '100%', justifyContent: 'center' }}>
            {[['Free', 'To list'], ['Direct', 'Messaging'], ['Verified', 'Reviews']].map(([val, lbl]) => (
              <View key={lbl} style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#1D9BF0' }}>{val}</Text>
                <Text style={{ fontSize: 11, color: '#606060', marginTop: 2, fontWeight: '600' }}>{lbl}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Benefits */}
        <View style={{ paddingHorizontal: 16, marginBottom: 28 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#909090', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>
            Why list on Breakthru
          </Text>
          <View style={{ gap: 10 }}>
            {BENEFITS.map((b) => (
              <View key={b.title} style={{
                flexDirection: 'row', alignItems: 'flex-start', gap: 14,
                backgroundColor: '#F7F7F7', borderRadius: 14, padding: 16,
              }}>
                <View style={{
                  width: 48, height: 48, borderRadius: 13,
                  backgroundColor: b.color + '18',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Text style={{ fontSize: 22 }}>{b.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F0F0F' }}>{b.title}</Text>
                  <Text style={{ fontSize: 13, color: '#606060', marginTop: 4, lineHeight: 19 }}>{b.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* How it works */}
        <View style={{ paddingHorizontal: 16, marginBottom: 32 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#909090', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>
            How it works
          </Text>
          <View style={{ gap: 0 }}>
            {STEPS.map((step, i) => (
              <View key={step.n} style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
                {/* Line + circle */}
                <View style={{ alignItems: 'center', width: 36 }}>
                  <View style={{
                    width: 36, height: 36, borderRadius: 18,
                    backgroundColor: '#1D9BF0',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 16, fontWeight: '900', color: '#FFFFFF' }}>{step.n}</Text>
                  </View>
                  {i < STEPS.length - 1 && (
                    <View style={{ width: 2, height: 28, backgroundColor: '#E7E7E7', marginTop: 2 }} />
                  )}
                </View>
                <View style={{ flex: 1, paddingTop: 6, paddingBottom: i < STEPS.length - 1 ? 16 : 0 }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F0F0F' }}>{step.title}</Text>
                  <Text style={{ fontSize: 13, color: '#606060', marginTop: 3, lineHeight: 19 }}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 40, gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-up')}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#1D9BF0',
              borderRadius: 50, paddingVertical: 17,
              alignItems: 'center',
              shadowColor: '#1D9BF0',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 }}>
              List Your Business — It's Free
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-in')}
            activeOpacity={0.85}
            style={{
              borderRadius: 50, paddingVertical: 16,
              alignItems: 'center',
              borderWidth: 2, borderColor: '#E7E7E7',
            }}
          >
            <Text style={{ color: '#0F0F0F', fontSize: 17, fontWeight: '700' }}>Already have an account? Sign In</Text>
          </TouchableOpacity>

          <Text style={{ textAlign: 'center', fontSize: 12, color: '#909090', marginTop: 4, lineHeight: 18 }}>
            Free to list · No contracts · Cancel anytime
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
