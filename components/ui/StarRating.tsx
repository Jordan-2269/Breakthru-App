import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type Props = {
  rating: number;
  maxStars?: number;
  size?: number;
  onRate?: (rating: number) => void;
  showCount?: boolean;
  count?: number;
};

export function StarRating({ rating, maxStars = 5, size = 16, onRate, showCount, count }: Props) {
  return (
    <View className="flex-row items-center gap-0.5">
      {Array.from({ length: maxStars }).map((_, i) => {
        const filled = i + 1 <= Math.round(rating);
        return (
          <TouchableOpacity
            key={i}
            disabled={!onRate}
            onPress={() => onRate?.(i + 1)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: size, color: filled ? '#F5A623' : '#D1D5DB' }}>
              {filled ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        );
      })}
      {showCount && count !== undefined && (
        <Text className="text-text-secondary text-xs ml-1">({count})</Text>
      )}
    </View>
  );
}
