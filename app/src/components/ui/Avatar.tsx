import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { FamilyMember } from '../../types/models';
import { personColor, personInitial } from '../../lib/people';

export function Avatar({
  member,
  allMembers,
  size = 22,
  onPress,
}: {
  member: FamilyMember | null;
  allMembers: FamilyMember[];
  size?: number;
  onPress?: () => void;
}) {
  const t = useTheme();
  const { bg, text } = personColor(member, t);
  const initial = personInitial(member, allMembers);
  const content = (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: text, fontSize: initial.length > 1 ? size * 0.36 : size * 0.45, fontFamily: t.font.bodyBold }}>
        {initial}
      </Text>
    </View>
  );
  if (!onPress) return content;
  return <Pressable onPress={onPress} hitSlop={6}>{content}</Pressable>;
}
