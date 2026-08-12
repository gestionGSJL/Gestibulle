import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useFamilyData } from '../state/FamilyDataContext';
import { Card, Tag, Seg, Button } from '../components/ui';
import { addDays, addMonths, startOfWeek, startOfMonth, toISO, todayISO, MONTH_NAMES, WEEKDAY_LETTERS, WEEKDAY_NAMES } from '../lib/dates';
import { eventsOnDate } from '../lib/selectors';
import { personColor } from '../lib/people';
import { REMINDER_META, FamilyEvent } from '../types/models';
import { useSwipe } from '../lib/useSwipe';
import { AddEditEventSheet } from '../sheets/AddEditEventSheet';

export function CalendarScreen() {
  const t = useTheme();
  const { events, members } = useFamilyData();
  const [view, setView] = useState<'week' | 'month'>('week');
  const [anchor, setAnchor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<FamilyEvent | null>(null);

  const swipeHandlers = useSwipe(
    () => setAnchor((a) => (view === 'week' ? addDays(a, 7) : addMonths(a, 1))),
    () => setAnchor((a) => (view === 'week' ? addDays(a, -7) : addMonths(a, -1)))
  );

  const weekStart = startOfWeek(anchor);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [anchor, view]
  );

  const monthStart = startOfMonth(anchor);
  const gridStart = startOfWeek(monthStart);
  const monthWeeks = useMemo(
    () => Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, i) => addDays(gridStart, w * 7 + i))),
    [anchor, view]
  );

  const periodLabel =
    view === 'week'
      ? `${weekStart.getDate()} – ${addDays(weekStart, 6).getDate()} ${MONTH_NAMES[addDays(weekStart, 6).getMonth()]}`
      : `${MONTH_NAMES[monthStart.getMonth()][0].toUpperCase()}${MONTH_NAMES[monthStart.getMonth()].slice(1)} ${monthStart.getFullYear()}`;

  const dotsForDay = (d: Date) => {
    const iso = toISO(d);
    const dayEvents = eventsOnDate(events, iso);
    const colors = new Set<string>();
    dayEvents.forEach((ev) => colors.add(personColor(members.find((m) => m.id === ev.assigned_to) ?? null, t).bg));
    return Array.from(colors);
  };

  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const selectedDayLabel = `${WEEKDAY_NAMES[selectedDateObj.getDay()]} ${selectedDateObj.getDate()} ${MONTH_NAMES[selectedDateObj.getMonth()]}`;
  const selectedDayEvents = useMemo(() => eventsOnDate(events, selectedDate), [events, selectedDate]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 22, paddingBottom: 4 }}>
        <Text style={{ fontFamily: t.font.heading, fontSize: 28, color: t.text }}>Calendrier</Text>
        <Seg
          options={[{ key: 'week', label: 'Semaine' }, { key: 'month', label: 'Mois' }]}
          value={view}
          onChange={setView}
        />
      </View>
      <Text style={{ textAlign: 'center', paddingVertical: 10, paddingHorizontal: 22, fontSize: 14, fontWeight: '600', color: t.text }}>
        {periodLabel}
      </Text>

      {view === 'week' ? (
        <View style={{ flexDirection: 'row', gap: 7, paddingHorizontal: 18, paddingBottom: 18 }} {...swipeHandlers}>
          {weekDays.map((d) => {
            const iso = toISO(d);
            const active = iso === selectedDate;
            const dots = dotsForDay(d);
            return (
              <Pressable
                key={iso}
                onPress={() => setSelectedDate(iso)}
                style={{ width: 42, paddingVertical: 8, borderRadius: 14, alignItems: 'center', backgroundColor: active ? t.accent[300] : t.neutral[100] }}
              >
                <Text style={{ fontSize: 10.5, color: active ? t.accent[800] : t.text }}>{WEEKDAY_LETTERS[d.getDay()]}</Text>
                <Text style={{ fontSize: 17, fontWeight: '700', marginTop: 2, color: active ? t.accent[800] : t.text }}>{d.getDate()}</Text>
                {dots.length ? (
                  <View style={{ flexDirection: 'row', gap: 2, marginTop: 4 }}>
                    {dots.map((c, i) => <View key={i} style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: c }} />)}
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={{ paddingHorizontal: 18, paddingBottom: 18 }} {...swipeHandlers}>
          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
            {WEEKDAY_LETTERS.map((l, i) => (
              <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10.5, color: t.neutral[600] }}>{l}</Text>
            ))}
          </View>
          {monthWeeks.map((week, wi) => (
            <View key={wi} style={{ flexDirection: 'row', marginBottom: 4, gap: 4 }}>
              {week.map((d) => {
                const iso = toISO(d);
                const active = iso === selectedDate;
                const inMonth = d.getMonth() === monthStart.getMonth();
                const dots = dotsForDay(d);
                return (
                  <Pressable
                    key={iso}
                    onPress={() => setSelectedDate(iso)}
                    style={{
                      flex: 1, aspectRatio: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 1,
                      backgroundColor: active ? t.accent[300] : 'transparent',
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: active ? '700' : '500', color: active ? t.accent[800] : inMonth ? t.text : t.neutral[400] }}>
                      {d.getDate()}
                    </Text>
                    {dots.length ? (
                      <View style={{ flexDirection: 'row', gap: 2 }}>
                        {dots.map((c, i) => <View key={i} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: c }} />)}
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      )}

      <Text style={{ paddingHorizontal: 22, paddingBottom: 10, fontFamily: t.font.heading, fontSize: 18, color: t.text }}>{selectedDayLabel}</Text>
      <Card style={{ marginHorizontal: 22, marginBottom: 20 }}>
        {selectedDayEvents.length === 0 ? (
          <Text style={{ padding: 18, color: t.neutral[600], fontSize: 14 }}>Aucun évènement ce jour.</Text>
        ) : null}
        {selectedDayEvents.map((ev, i) => {
          const person = members.find((m) => m.id === ev.assigned_to) ?? null;
          const spanSuffix = ev.end_date !== ev.start_date
            ? ` · ${new Date(ev.start_date + 'T00:00:00').getDate()}–${new Date(ev.end_date + 'T00:00:00').getDate()} ${MONTH_NAMES[new Date(ev.end_date + 'T00:00:00').getMonth()]}`
            : '';
          const reminderSuffix = ev.reminders?.length ? ` · Rappel ${ev.reminders.map((r) => REMINDER_META[r]).join(', ')}` : '';
          return (
            <Pressable
              key={ev.id}
              onPress={() => { setEditingEvent(ev); setSheetOpen(true); }}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13,
                borderBottomWidth: i === selectedDayEvents.length - 1 ? 0 : 1, borderBottomColor: t.neutral[200],
              }}
            >
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: personColor(person, t).bg }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, color: t.text, fontWeight: '600' }}>{ev.title}</Text>
                <Text style={{ fontSize: 12.5, color: t.neutral[600] }}>
                  {ev.all_day ? 'Toute la journée' : ev.time}{spanSuffix}{reminderSuffix}
                </Text>
              </View>
              <Tag label={person ? person.name : 'Vous deux'} variant={ev.assigned_to === members[0]?.id ? 'tag-accent' : 'tag-accent-2'} small />
            </Pressable>
          );
        })}
      </Card>

      <View style={{ paddingHorizontal: 22, paddingBottom: 28 }}>
        <Button label="+ Ajouter un rendez-vous" variant="secondary" block onPress={() => { setEditingEvent(null); setSheetOpen(true); }} />
      </View>

      <AddEditEventSheet
        visible={sheetOpen}
        onClose={() => { setSheetOpen(false); setEditingEvent(null); }}
        editingEvent={editingEvent}
        defaultDate={selectedDate}
      />
    </ScrollView>
  );
}
