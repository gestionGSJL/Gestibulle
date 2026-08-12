import React from 'react';
import { View } from 'react-native';
import { Chip } from './ui';
import { ReminderKey, REMINDER_META } from '../types/models';

const KEYS = Object.keys(REMINDER_META) as ReminderKey[];

export function ReminderChips({ value, onChange }: { value: ReminderKey[]; onChange: (next: ReminderKey[]) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {KEYS.map((key) => {
        const active = value.includes(key);
        return (
          <Chip
            key={key}
            label={REMINDER_META[key]}
            active={active}
            onPress={() => onChange(active ? value.filter((k) => k !== key) : [...value, key])}
          />
        );
      })}
    </View>
  );
}
