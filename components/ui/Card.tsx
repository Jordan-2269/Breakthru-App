import React from 'react';
import { View, ViewStyle } from 'react-native';

type Props = {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  style?: ViewStyle;
};

export function Card({ children, className = '', noPadding = false, style }: Props) {
  return (
    <View
      className={`bg-surface rounded-lg border border-border shadow-sm ${noPadding ? '' : 'p-4'} ${className}`}
      style={style}
    >
      {children}
    </View>
  );
}
