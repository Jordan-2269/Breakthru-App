import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from 'react-native';

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

const SIZE: Record<Size, { paddingVertical: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 13 },
  md: { paddingVertical: 12, paddingHorizontal: 22, fontSize: 15 },
  lg: { paddingVertical: 16, paddingHorizontal: 28, fontSize: 17 },
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
  const s = SIZE[size];

  const containerStyle: any = {
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: s.paddingVertical,
    paddingHorizontal: s.paddingHorizontal,
    alignSelf: fullWidth ? undefined : 'flex-start',
    width: fullWidth ? '100%' : undefined,
    opacity: isDisabled ? 0.5 : 1,
    ...(variant === 'filled' ? {
      backgroundColor: '#1D9BF0',
      shadowColor: '#1D9BF0',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 6,
    } : variant === 'outlined' ? {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: '#1D9BF0',
    } : {
      backgroundColor: 'transparent',
    }),
  };

  const textStyle: any = {
    fontSize: s.fontSize,
    fontWeight: '800',
    color: variant === 'filled' ? '#FFFFFF' : '#1D9BF0',
    letterSpacing: 0.2,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={containerStyle}
      activeOpacity={0.82}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'filled' ? '#fff' : '#1D9BF0'} />
      ) : (
        <>
          {icon && <View style={{ marginRight: 7 }}>{icon}</View>}
          <Text style={textStyle}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
