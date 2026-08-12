import React, { useState } from 'react';
import { View } from 'react-native';
import { Sheet, Field, Chip, Button } from '../../components/ui';
import { TimeField } from '../../components/DateTimeField';
import { TrashReminderMode } from '../../lib/ics';

export function TrashReminderPromptSheet({
  visible,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (mode: TrashReminderMode, time: string) => void;
}) {
  const [mode, setMode] = useState<TrashReminderMode>('silent');
  const [time, setTime] = useState('18:00');

  return (
    <Sheet visible={visible} onClose={onCancel} title="Rappel silencieux">
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <Chip label="Aucun" active={mode === 'none'} onPress={() => setMode('none')} />
        <Chip label="Standard" active={mode === 'standard'} onPress={() => setMode('standard')} />
        <Chip label="Silencieux" active={mode === 'silent'} onPress={() => setMode('silent')} />
      </View>
      {mode !== 'none' ? (
        <Field label="Heure du rappel" style={{ marginBottom: 20 }}>
          <TimeField value={time} onChange={setTime} />
        </Field>
      ) : (
        <View style={{ marginBottom: 20 }} />
      )}
      <Button label="Importer" onPress={() => onConfirm(mode, time)} block />
    </Sheet>
  );
}
