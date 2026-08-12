import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { useTheme } from '../../theme/ThemeContext';
import { useFamilyData } from '../../state/FamilyDataContext';
import { Sheet, Card } from '../../components/ui';
import { TrashReminderPromptSheet } from './TrashReminderPromptSheet';
import { parseIcs, TrashReminderMode } from '../../lib/ics';
import { scheduleTaskDueNotification } from '../../lib/notifications';

export function ImportSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useTheme();
  const { bulkAddEvents, bulkAddTasks } = useFamilyData();
  const [message, setMessage] = useState<string | null>(null);
  const [pendingTrashText, setPendingTrashText] = useState<string | null>(null);

  const pickCalendarFile = async () => {
    setMessage(null);
    const result = await DocumentPicker.getDocumentAsync({ type: ['text/calendar', 'application/octet-stream', '*/*'] });
    if (result.canceled || !result.assets?.[0]) return;
    const text = await new File(result.assets[0].uri).text();
    const parsed = parseIcs(text, 'calendar');
    await bulkAddEvents(parsed.events);
    setMessage(parsed.message);
  };

  const pickTrashFile = async () => {
    setMessage(null);
    const result = await DocumentPicker.getDocumentAsync({ type: ['text/calendar', 'application/octet-stream', '*/*'] });
    if (result.canceled || !result.assets?.[0]) return;
    const text = await new File(result.assets[0].uri).text();
    setPendingTrashText(text);
  };

  const confirmTrashImport = async (mode: TrashReminderMode, time: string) => {
    if (!pendingTrashText) return;
    const parsed = parseIcs(pendingTrashText, 'trash', time, mode);
    const inserted = await bulkAddTasks(
      parsed.tasks.map((tk) => ({ title: tk.title, category: 'entretien' as const, due_date: tk.due_date, due_time: tk.due_time }))
    );
    if (mode !== 'none') {
      await Promise.all(
        inserted
          .filter((tk) => tk.due_date && tk.due_time)
          .map((tk) => scheduleTaskDueNotification({ taskId: tk.id, title: tk.title, date: tk.due_date!, time: tk.due_time!, silent: mode === 'silent' }))
      );
    }
    setMessage(parsed.message);
    setPendingTrashText(null);
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Importer">
      <Card>
        <Pressable
          onPress={pickCalendarFile}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: 13, borderBottomWidth: 1, borderBottomColor: t.neutral[200] }}
        >
          <Text style={{ fontSize: 14, color: t.text }}>Calendrier</Text>
          <Text style={{ fontSize: 12.5, fontFamily: t.font.bodySemiBold, color: t.accent[700] }}>Choisir un fichier</Text>
        </Pressable>
        <Pressable
          onPress={pickTrashFile}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: 13 }}
        >
          <Text style={{ fontSize: 14, color: t.text }}>Calendrier de poubelle</Text>
          <Text style={{ fontSize: 12.5, fontFamily: t.font.bodySemiBold, color: t.accent[700] }}>Choisir un fichier</Text>
        </Pressable>
      </Card>
      {message ? <Text style={{ paddingTop: 12, fontSize: 12.5, color: t.neutral[700] }}>{message}</Text> : null}

      <TrashReminderPromptSheet
        visible={!!pendingTrashText}
        onCancel={() => setPendingTrashText(null)}
        onConfirm={confirmTrashImport}
      />
    </Sheet>
  );
}
