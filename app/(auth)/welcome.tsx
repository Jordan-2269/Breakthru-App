import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const FEATURES = [
  {
    emoji: '📍',
    title: 'Find Local Services',
    desc: 'Discover autism therapists and centers near you using your location.',
    bg: '#EAF6FF',
    accent: '#0A66C2',
    border: '#B3D9F5',
  },
  {
    emoji: '🎯',
    title: 'Personalized Matches',
    desc: "Get recommendations tailored to your child's diagnosis and therapy needs.",
    bg: '#FFF4E5',
    accent: '#E07B00',
    border: '#FFDAA6',
  },
  {
    emoji: '⭐',
    title: 'Top-Rated Therapists',
    desc: 'Browse detailed profiles with experience, specializations, and real reviews.',
    bg: '#F0FBF4',
    accent: '#1A8C4E',
    border: '#A8E6C0',
  },
  {
    emoji: '💬',
    title: 'Message Providers',
    desc: 'Reach out directly to clinics and therapists to ask questions.',
    bg: '#F5F0FF',
    accent: '#6B3FA0',
    border: '#D4B8F5',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F7FF' }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero gradient header */}
        <View
          style={{
            background: 'linear-gradient(135deg, #0A66C2 0%, #0D9488 100%)',
            backgroundColor: '#0A66C2',
            paddingTop: 48,
            paddingBottom: 48,
            paddingHorizontal: 24,
            alignItems: 'center',
          }}
        >
          {/* Logo */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              borderWidth: 2,
              borderColor: 'rgba(255,255,255,0.4)',
            }}
          >
            <Text style={{ fontSize: 40, fontWeight: '800', color: '#FFFFFF' }}>B</Text>
          </View>

          <Text style={{ fontSize: 34, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 }}>
            Breakthru
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: '600', letterSpacing: 1.5, marginTop: 4, textTransform: 'uppercase' }}>
            Autism Services
          </Text>

          {/* Tagline */}
          <View
            style={{
              marginTop: 20,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 12,
              paddingHorizontal: 20,
              paddingVertical: 12,
              maxWidth: 320,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 15, textAlign: 'center', lineHeight: 22, fontWeight: '500' }}>
              Connecting families with the autism support their children deserve
            </Text>
          </View>

          {/* Colorful dots decoration */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
            {['#FF9F43', '#EE5A24', '#0ABDE3', '#10AC84', '#5F27CD'].map((c, i) => (
              <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c }} />
            ))}
          </View>
        </View>

        {/* Stats bar */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: '#E0DFDB',
          }}
        >
          {[
            { value: '500+', label: 'Providers' },
            { value: '4.8★', label: 'Avg Rating' },
            { value: 'Free', label: 'To Use' },
          ].map((s, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 14,
                borderRightWidth: i < 2 ? 1 : 0,
                borderRightColor: '#E0DFDB',
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A66C2' }}>{s.value}</Text>
              <Text style={{ fontSize: 11, color: '#666666', marginTop: 1 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Feature cards */}
        <View style={{ padding: 20, gap: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#999999', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
            Everything you need
          </Text>
          {FEATURES.map((f) => (
            <View
              key={f.title}
              style={{
                backgroundColor: f.bg,
                borderRadius: 16,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: f.border,
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: f.accent,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 2,
                  flexShrink: 0,
                }}
              >
                <Text style={{ fontSize: 24 }}>{f.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: f.accent }}>{f.title}</Text>
                <Text style={{ fontSize: 13, color: '#444444', marginTop: 2, lineHeight: 18 }}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA buttons */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 36, gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-up')}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#0A66C2',
              borderRadius: 50,
              paddingVertical: 16,
              alignItems: 'center',
              shadowColor: '#0A66C2',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 }}>
              Get Started — It's Free
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-in')}
            activeOpacity={0.85}
            style={{
              borderRadius: 50,
              paddingVertical: 15,
              alignItems: 'center',
              borderWidth: 2,
              borderColor: '#0A66C2',
              backgroundColor: '#FFFFFF',
            }}
          >
            <Text style={{ color: '#0A66C2', fontSize: 17, fontWeight: '700' }}>Sign In</Text>
          </TouchableOpacity>

          <Text style={{ textAlign: 'center', fontSize: 11, color: '#999999', marginTop: 4 }}>
            Free for families · Businesses list from $0/month
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
