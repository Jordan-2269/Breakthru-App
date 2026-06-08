import React from 'react';
import { Image, View, Text } from 'react-native';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizePx: Record<Size, number> = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 64,
  xl: 96,
};

type Props = {
  uri?: string | null;
  name?: string;
  size?: Size;
  border?: boolean;
};

export function Avatar({ uri, name, size = 'md', border = false }: Props) {
  const px = sizePx[size];
  const fontSize = Math.round(px * 0.35);
  const initials = name
    ? name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <View
      style={{
        width: px,
        height: px,
        borderRadius: px / 2,
        overflow: 'hidden',
        borderWidth: border ? 3 : 0,
        borderColor: '#fff',
      }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: px, height: px }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{ width: px, height: px }}
          className="bg-primary-light items-center justify-center"
        >
          <Text style={{ fontSize }} className="text-primary font-semibold">
            {initials}
          </Text>
        </View>
      )}
    </View>
  );
}
