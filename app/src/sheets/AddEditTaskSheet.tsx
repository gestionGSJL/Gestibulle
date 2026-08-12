import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useFamilyData } from '../state/FamilyDataContext';
import { Sheet, Field, Input, Button, Chip } from '../components/ui';
import { PersonChips } from '../components/PersonChips';
import { ReminderChips } from '../components/ReminderChips';
import { DateField, TimeField } from '../components/DateTimeField';
import { FamilyTask, ReminderKey, TaskCategory, CATEGORY_META } from '../types/models';
import { rescheduleReminders, cancelReminders } from '../lib/notifications';

const CATEGORY_KEYS = Object.keys(CATEGORY_META) as TaskCategory[];

export function AddEditTaskSheet({
  visible,
  onClose,
  editingTask,
}: {
  visible: boolean;
  onClose: () => void;
  editingTask: FamilyTask | null;
}) {
  const t = useTheme();
  const { members, addTask, updateTask, deleteTask } = useFamilyData();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('entretien');
  const [person, setPerson] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [reminders, setReminders] = useState<ReminderKey[]>([]);

  useEffect(() => {
    if (!visible) return;
    if (editingTask) {
      setTitle(editingTask.title);
      setCategory(editingTask.category);
      setPerson(editingTask.assigned_to);
      setDate(editingTask.due_date);
      setTime(editingTask.due_time);
      setReminders(editingTask.reminders ?? []);
    } else {
      setTitle('');
      setCategory('entretien');
      setPerson(null);
      setDate(null);
      setTime(null);
      setReminders([]);
    }
  }, [visible, editingTask]);

  const submit = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const data = { title: trimmed, category, assigned_to: person, due_date: date, due_time: time, reminders };
    let id = editingTask?.id ?? null;
    if (editingTask) await updateTask(editingTask.id, data);
    else id = await addTask(data);

    if (id) {
      await rescheduleReminders({
        entityType: 'task', entityId: id, title: 'Tâche', body: trimmed, date, time, reminders,
      });
    }
    onClose();
  };

  const remove = async () => {
    if (!editingTask) return;
    await cancelReminders('task', editingTask.id);
    await deleteTask(editingTask.id);
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}>
      <Field label="Titre" style={{ marginBottom: 14 }}>
        <Input value={title} onChangeText={setTitle} placeholder="Ex. Renouveler l'assurance auto" />
      </Field>

      <Text style={{ fontSize: 12.5, fontFamily: t.font.bodySemiBold, color: t.neutral[700], marginBottom: 8 }}>Catégorie</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {CATEGORY_KEYS.map((key) => (
          <Chip key={key} label={CATEGORY_META[key].label} active={category === key} onPress={() => setCategory(key)} />
        ))}
      </View>

      <Text style={{ fontSize: 12.5, fontFamily: t.font.bodySemiBold, color: t.neutral[700], marginBottom: 8 }}>Assignée à</Text>
      <View style={{ marginBottom: 16 }}>
        <PersonChips members={members} value={person} onChange={setPerson} />
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
        <Field label="Date (optionnel)" style={{ flex: 1 }}>
          <DateField value={date} onChange={setDate} />
        </Field>
        <Field label="Heure (optionnel)" style={{ flex: 1 }}>
          <TimeField value={time} onChange={setTime} />
        </Field>
      </View>

      <Text style={{ fontSize: 12.5, fontFamily: t.font.bodySemiBold, color: t.neutral[700], marginBottom: 8 }}>Rappel</Text>
      <View style={{ marginBottom: 20 }}>
        <ReminderChips value={reminders} onChange={setReminders} />
      </View>

      <Button label={editingTask ? 'Enregistrer les modifications' : 'Ajouter la tâche'} onPress={submit} block />
      {editingTask ? (
        <Button label="Supprimer la tâche" variant="ghost" onPress={remove} style={{ marginTop: 10 }} />
      ) : null}
    </Sheet>
  );
}
