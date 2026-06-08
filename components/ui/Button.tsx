import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

type Variant = 'filled' | 'outlined' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
};

const sizeClasses: Record<Size, { container: string; text: string }> = {
  sm: { container: 'py-1.5 px-3', text: 'text-sm' },
  md: { container: 'py-2.5 px-5', text: 'text-base' },
  lg: { container: 'py-3.5 px-7', text: 'text-lg' },
};

export function Button({
  label,
  onPress,
  variant = 'filled',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
}: Props) {
  const isDisabled = disabled || loading;

  const containerBase = `rounded-full flex-row items-center justify-center ${sizeClasses[size].container}`;
  const containerVariant =
    variant === 'filled'
      ? `bg-primary ${isDisabled ? 'opacity-50' : ''}`
      : variant === 'outlined'
      ? `border border-primary ${isDisabled ? 'opacity-50' : ''}`
      : `${isDisabled ? 'opacity-50' : ''}`;

  const textVariant =
    variant === 'filled'
      ? `text-white font-semibold ${sizeClasses[size].text}`
      : `text-primary font-semibold ${sizeClasses[size].text}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`${containerBase} ${containerVariant} ${fullWidth ? 'w-full' : 'self-start'}`}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'filled' ? '#fff' : '#0A66C2'} />
      ) : (
        <>
          {icon && <View className="mr-1.5">{icon}</View>}
          <Text className={textVariant}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
