import React from 'react';
import { View, Text } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export function SectionTitle({ title, subtitle, action }: Props) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <View className="flex-1">
        <Text className="text-base font-semibold text-text-primary">{title}</Text>
        {subtitle && <Text className="text-xs text-text-secondary mt-0.5">{subtitle}</Text>}
      </View>
      {action}
    </View>
  );
}
