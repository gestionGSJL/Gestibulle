import React from 'react';
import { View } from 'react-native';
import { Chip } from './ui';
import { FamilyMember } from '../types/models';

// Person picker used by add/edit task & event sheets: every family member, plus "Tout le monde".
export function PersonChips({
  members,
  value,
  onChange,
}: {
  members: FamilyMember[];
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {members.map((m) => (
        <Chip key={m.id} label={m.name} active={value === m.id} onPress={() => onChange(m.id)} />
      ))}
      <Chip label="Vous deux" active={value === null} onPress={() => onChange(null)} />
    </View>
  );
}
