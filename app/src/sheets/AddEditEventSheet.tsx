import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useFamilyData } from '../state/FamilyDataContext';
import { Sheet, Field, Input, Button, Chip } from '../components/ui';
import { PersonChips } from '../components/PersonChips';
import { ReminderChips } from '../components/ReminderChips';
import { DateField, TimeField } from '../components/DateTimeField';
import { FamilyEvent, ReminderKey } from '../types/models';
import { rescheduleReminders, cancelReminders } from '../lib/notifications';

export function AddEditEventSheet({
  visible,
  onClose,
  editingEvent,
  defaultDate,
}: {
  visible: boolean;
  onClose: () => void;
  editingEvent: FamilyEvent | null;
  defaultDate: string;
}) {
  const t = useTheme();
  const { members, addEvent, updateEvent, deleteEvent } = useFamilyData();

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(defaultDate);
  const [endDate, setEndDate] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [time, setTime] = useState('14:00');
  const [person, setPerson] = useState<string | null>(null);
  const [reminders, setReminders] = useState<ReminderKey[]>(['1d']);

  useEffect(() => {
    if (!visible) return;
    if (editingEvent) {
      setTitle(editingEvent.title);
      setStartDate(editingEvent.start_date);
      setEndDate(editingEvent.end_date !== editingEvent.start_date ? editingEvent.end_date : '');
      setAllDay(editingEvent.all_day);
      setTime(editingEvent.time ?? '14:00');
      setPerson(editingEvent.assigned_to);
      setReminders(editingEvent.reminders?.length ? editingEvent.reminders : []);
    } else {
      setTitle('');
      setStartDate(defaultDate);
      setEndDate('');
      setAllDay(false);
      setTime('14:00');
      setPerson(null);
      setReminders(['1d']);
    }
  }, [visible, editingEvent, defaultDate]);

  const submit = async () => {
    const trimmed = title.trim();
    if (!trimmed || !startDate) return;
    const finalEnd = endDate && endDate >= startDate ? endDate : startDate;
    const data = {
      title: trimmed,
      start_date: startDate,
      end_date: finalEnd,
      all_day: allDay,
      time: allDay ? null : time,
      assigned_to: person,
      reminders,
    };
    let id = editingEvent?.id ?? null;
    if (editingEvent) await updateEvent(editingEvent.id, data);
    else id = await addEvent(data);

    if (id) {
      await rescheduleReminders({
        entityType: 'event', entityId: id, title: 'Rendez-vous', body: trimmed,
        date: startDate, time: allDay ? null : time, reminders,
      });
    }
    onClose();
  };

  const remove = async () => {
    if (!editingEvent) return;
    await cancelReminders('event', editingEvent.id);
    await deleteEvent(editingEvent.id);
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={editingEvent ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}>
      <Field label="Titre" style={{ marginBottom: 14 }}>
        <Input value={title} onChangeText={setTitle} placeholder="Ex. Rendez-vous vétérinaire" />
      </Field>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
        <Field label="Début" style={{ flex: 1 }}>
          <DateField value={startDate} onChange={setStartDate} />
        </Field>
        <Field label="Fin (optionnel)" style={{ flex: 1 }}>
          <DateField value={endDate || null} onChange={setEndDate} placeholder="Même jour" />
        </Field>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Text style={{ fontSize: 12.5, fontFamily: t.font.bodySemiBold, color: t.neutral[700] }}>Heure</Text>
        <Chip label="Toute la journée" active={allDay} onPress={() => setAllDay((v) => !v)} />
      </View>
      {!allDay ? (
        <View style={{ marginBottom: 16 }}>
          <TimeField value={time} onChange={setTime} />
        </View>
      ) : (
        <View style={{ marginBottom: 16 }} />
      )}

      <Text style={{ fontSize: 12.5, fontFamily: t.font.bodySemiBold, color: t.neutral[700], marginBottom: 8 }}>Concerne</Text>
      <View style={{ marginBottom: 16 }}>
        <PersonChips members={members} value={person} onChange={setPerson} />
      </View>

      <Text style={{ fontSize: 12.5, fontFamily: t.font.bodySemiBold, color: t.neutral[700], marginBottom: 8 }}>Rappel</Text>
      <View style={{ marginBottom: 20 }}>
        <ReminderChips value={reminders} onChange={setReminders} />
      </View>

      <Button label={editingEvent ? 'Enregistrer les modifications' : 'Ajouter le rendez-vous'} onPress={submit} block />
      {editingEvent ? (
        <Button label="Supprimer le rendez-vous" variant="ghost" onPress={remove} style={{ marginTop: 10 }} />
      ) : null}
    </Sheet>
  );
}
