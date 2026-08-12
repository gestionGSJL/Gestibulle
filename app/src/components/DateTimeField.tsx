import React, { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../theme/ThemeContext';
import { Button } from './ui';
import { toISO, formatTimeFR } from '../lib/dates';

const WEEKDAYS = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

function formatDateShort(d: Date) {
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function DateField({ value, onChange, placeholder }: { value: string | null; onChange: (iso: string) => void; placeholder?: string }) {
  const t = useTheme();
  const [show, setShow] = useState(false);
  const dateValue = value ? new Date(value + 'T00:00:00') : new Date();

  return (
    <View>
      <Pressable
        onPress={() => setShow(true)}
        style={{
          minHeight: 44, paddingHorizontal: 14, justifyContent: 'center',
          backgroundColor: t.bg, borderWidth: 1, borderColor: t.neutral[300], borderRadius: t.radius.pill,
        }}
      >
        <Text style={{ fontSize: 14, color: value ? t.text : t.neutral[500], fontFamily: t.font.body }}>
          {value ? formatDateShort(dateValue) : placeholder ?? 'Choisir une date'}
        </Text>
      </Pressable>
      {show && (
        <DateTimeField_Native
          value={dateValue}
          mode="date"
          onClose={() => setShow(false)}
          onChange={(d) => onChange(toISO(d))}
        />
      )}
    </View>
  );
}

export function TimeField({ value, onChange }: { value: string | null; onChange: (hhmm: string) => void }) {
  const t = useTheme();
  const [show, setShow] = useState(false);
  const now = new Date();
  const [h, m] = (value ?? '12:00').split(':').map(Number);
  const timeValue = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);

  return (
    <View>
      <Pressable
        onPress={() => setShow(true)}
        style={{
          minHeight: 44, paddingHorizontal: 14, justifyContent: 'center',
          backgroundColor: t.bg, borderWidth: 1, borderColor: t.neutral[300], borderRadius: t.radius.pill,
        }}
      >
        <Text style={{ fontSize: 14, color: value ? t.text : t.neutral[500], fontFamily: t.font.body }}>
          {value ? formatTimeFR(value) : 'Choisir une heure'}
        </Text>
      </Pressable>
      {show && (
        <DateTimeField_Native
          value={timeValue}
          mode="time"
          onClose={() => setShow(false)}
          onChange={(d) => onChange(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)}
        />
      )}
    </View>
  );
}

function DateTimeField_Native({
  value, mode, onChange, onClose,
}: {
  value: Date; mode: 'date' | 'time'; onChange: (d: Date) => void; onClose: () => void;
}) {
  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={value}
        mode={mode}
        display="default"
        onChange={(event, selected) => {
          onClose();
          if (event.type !== 'dismissed' && selected) onChange(selected);
        }}
      />
    );
  }
  // iOS: inline spinner with an explicit confirm button (no native dismiss otherwise).
  let pending = value;
  return (
    <View style={{ marginTop: 8 }}>
      <DateTimePicker value={value} mode={mode} display="spinner" onChange={(_e, selected) => { if (selected) pending = selected; }} />
      <Button label="OK" variant="secondary" onPress={() => { onChange(pending); onClose(); }} />
    </View>
  );
}
