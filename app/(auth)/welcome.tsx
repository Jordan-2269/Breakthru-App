import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const FEATURES = [
  { emoji: '📍', title: 'Find Local Services', desc: 'Discover autism therapists and centers near you.', color: '#1D9BF0' },
  { emoji: '🎯', title: 'Personalized Matches', desc: "Recommendations tailored to your child's exact needs.", color: '#FF6B35' },
  { emoji: '⭐', title: 'Top-Rated Therapists', desc: 'Real reviews and detailed profiles for every provider.', color: '#00BA7C' },
  { emoji: '💬', title: 'Message Providers', desc: 'Reach out directly — no middleman, no delays.', color: '#805AD5' },
];

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={{
          backgroundColor: '#0F0F0F',
          paddingTop: 52,
          paddingBottom: 52,
          paddingHorizontal: 28,
          alignItems: 'center',
        }}>
          <View style={{
            width: 88, height: 88, borderRadius: 22,
            backgroundColor: '#1D9BF0',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
            shadowColor: '#1D9BF0',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 12,
          }}>
            <Text style={{ fontSize: 44, fontWeight: '900', color: '#FFFFFF' }}>B</Text>
          </View>

          <Text style={{ fontSize: 38, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1 }}>
            Breakthru
          </Text>
          <Text style={{ fontSize: 13, color: '#606060', fontWeight: '700', letterSpacing: 2.5, marginTop: 6, textTransform: 'uppercase' }}>
            Autism Services
          </Text>

          <Text style={{ color: '#AAAAAA', fontSize: 16, textAlign: 'center', lineHeight: 24, fontWeight: '400', marginTop: 20, maxWidth: 300 }}>
            Connecting families with the autism support their children deserve
          </Text>

          {/* Stats row */}
          <View style={{ flexDirection: 'row', gap: 24, marginTop: 32 }}>
            {[['500+', 'Providers'], ['4.8★', 'Rating'], ['Free', 'Forever']].map(([val, lbl]) => (
              <View key={lbl} style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '900', color: '#1D9BF0' }}>{val}</Text>
                <Text style={{ fontSize: 11, color: '#606060', marginTop: 2, fontWeight: '600' }}>{lbl}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Feature list */}
        <View style={{ padding: 24, gap: 14 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#909090', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
            Everything you need
          </Text>
          {FEATURES.map((f) => (
            <View key={f.title} style={{
              flexDirection: 'row', alignItems: 'center', gap: 16,
              backgroundColor: '#F7F7F7',
              borderRadius: 14, padding: 16,
            }}>
              <View style={{
                width: 52, height: 52, borderRadius: 14,
                backgroundColor: f.color + '18',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Text style={{ fontSize: 26 }}>{f.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F0F0F' }}>{f.title}</Text>
                <Text style={{ fontSize: 13, color: '#606060', marginTop: 3, lineHeight: 18 }}>{f.desc}</Text>
              </View>
              <Text style={{ fontSize: 18, color: '#CCCCCC' }}>›</Text>
            </View>
          ))}
        </View>

        {/* CTAs */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 40, gap: 12 }}>
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
              Get Started — It's Free
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-in')}
            activeOpacity={0.85}
            style={{
              borderRadius: 50, paddingVertical: 16,
              alignItems: 'center',
              borderWidth: 2, borderColor: '#E7E7E7',
              backgroundColor: '#FFFFFF',
            }}
          >
            <Text style={{ color: '#0F0F0F', fontSize: 17, fontWeight: '700' }}>Sign In</Text>
          </TouchableOpacity>

          <Text style={{ textAlign: 'center', fontSize: 12, color: '#909090', marginTop: 4 }}>
            Free for families · Businesses list from $0/month
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
