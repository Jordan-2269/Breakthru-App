import React from 'react';
import { View, Text } from 'react-native';
import { getMatchColor, getMatchLabel } from '@/lib/matchScore';

type Props = {
  score: number;
  size?: 'sm' | 'md';
};

export function MatchScoreBadge({ score, size = 'md' }: Props) {
  const color = getMatchColor(score);
  const isSmall = size === 'sm';
  const dim = isSmall ? 52 : 62;

  return (
    <View
      style={{
        width: dim,
        height: dim,
        borderRadius: dim / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 4,
        elevation: 5,
      }}
    >
      <Text style={{ color: '#FFFFFF', fontSize: isSmall ? 14 : 16, fontWeight: '900', lineHeight: isSmall ? 16 : 18 }}>
        {score}%
      </Text>
      <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 8, fontWeight: '700', letterSpacing: 0.3 }}>
        MATCH
      </Text>
    </View>
  );
}
