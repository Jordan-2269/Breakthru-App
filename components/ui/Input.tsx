import React, { useState } from 'react';
import { TextInput, View, Text, TextInputProps, TouchableOpacity } from 'react-native';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
};

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  ...props
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-text-primary mb-1.5">{label}</Text>
      )}
      <View
        className={`flex-row items-center border rounded-lg px-3 bg-surface ${
          error
            ? 'border-warning'
            : focused
            ? 'border-primary'
            : 'border-border'
        }`}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          className="flex-1 py-3 text-base text-text-primary"
          placeholderTextColor="#999999"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[{ outlineWidth: 0, outlineStyle: 'none' } as any, style]}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} className="ml-2">
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-warning text-xs mt-1">{error}</Text>}
    </View>
  );
}
