import React from 'react';
import { Pressable, View, StyleProp, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';

export function IconButton({
  icon: Icon,
  onPress,
  size = 38,
  iconSize = 20,
  bg,
  color,
  style,
}: {
  icon: LucideIcon;
  onPress?: () => void;
  size?: number;
  iconSize?: number;
  bg?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bg ?? t.neutral[200],
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}
      >
        <Icon size={iconSize} color={color ?? t.neutral[700]} strokeWidth={2.75} />
      </View>
    </Pressable>
  );
}
