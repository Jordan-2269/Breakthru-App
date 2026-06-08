import React from 'react';
import { View, Text } from 'react-native';

type Variant = 'primary' | 'success' | 'warning' | 'neutral' | 'unclaimed';

const variants: Record<Variant, string> = {
  primary: 'bg-primary-light',
  success: 'bg-green-100',
  warning: 'bg-amber-100',
  neutral: 'bg-gray-100',
  unclaimed: 'bg-orange-100',
};

const textVariants: Record<Variant, string> = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  neutral: 'text-text-secondary',
  unclaimed: 'text-orange-700',
};

type Props = {
  label: string;
  variant?: Variant;
  small?: boolean;
};

export function Badge({ label, variant = 'primary', small = false }: Props) {
  return (
    <View className={`rounded-full px-2.5 py-0.5 self-start ${variants[variant]}`}>
      <Text className={`${small ? 'text-xs' : 'text-sm'} font-medium ${textVariants[variant]}`}>
        {label}
      </Text>
    </View>
  );
}
