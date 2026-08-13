import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Settings } from 'lucide-react-native';
import { Screen } from '../components/Screen';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../state/AuthContext';
import { useFamilyData } from '../state/FamilyDataContext';
import { Card, Tag, Checkbox, Avatar } from '../components/ui';
import { SettingsHost } from '../sheets/settings/SettingsHost';
import { addDays, toISO, todayISO, startOfWeek, MONTH_NAMES, WEEKDAY_NAMES } from '../lib/dates';
import { eventsOnDate, tasksOnDate } from '../lib/selectors';
import { personColor, personName, cyclePersonId } from '../lib/people';
import { CATEGORY_META } from '../types/models';
import { useSwipe } from '../lib/useSwipe';

export function HomeScreen() {
  const t = useTheme();
  const { member } = useAuth();
  const { members, events, tasks, mealPlan, recipes } = useFamilyData();
  const [dayOffset, setDayOffset] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const today = new Date();
  const todayIso = todayISO();
  const homeDate = addDays(today, dayOffset);
  const homeIso = toISO(homeDate);

  const swipeHandlers = useSwipe(
    () => setDayOffset((o) => o + 1),
    () => setDayOffset((o) => o - 1)
  );

  const todayDateLabel = `${WEEKDAY_NAMES[today.getDay()]} ${today.getDate()} ${MONTH_NAMES[today.getMonth()]} ${today.getFullYear()}`;
  const homeDayLabel = dayOffset === 0 ? "Aujourd'hui" : `${WEEKDAY_NAMES[homeDate.getDay()]} ${homeDate.getDate()} ${MONTH_NAMES[homeDate.getMonth()]}`;

  const todaysTasks = useMemo(() => tasksOnDate(tasks, todayIso), [tasks, todayIso]);
  const pendingTasksCount = todaysTasks.filter((tk) => !tk.completed).length;

  const weekStart = toISO(startOfWeek(today));
  const weekEnd = toISO(addDays(startOfWeek(today), 6));
  const mealsPlannedCount = mealPlan.filter((m) => m.date >= weekStart && m.date <= weekEnd && m.recipe_id).length;

  const homeEvents = useMemo(() => eventsOnDate(events, homeIso), [events, homeIso]);
  const homeTasks = useMemo(() => tasksOnDate(tasks, homeIso), [tasks, homeIso]);

  const tonightRecipeId = mealPlan.find((m) => m.date === todayIso)?.recipe_id ?? null;
  const tonightRecipe = tonightRecipeId ? recipes.find((r) => r.id === tonightRecipeId) : null;

  const upcomingTasks = useMemo(() => {
    const start = toISO(addDays(today, 1));
    const end = toISO(addDays(today, 10));
    return tasks
      .filter((tk) => !tk.completed && tk.due_date && tk.due_date >= start && tk.due_date <= end)
      .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))
      .slice(0, 5);
  }, [tasks, todayIso]);

  const { toggleTask, updateTask } = useFamilyData();

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', padding: 22, paddingBottom: 6 }}>
        <View>
          <Text style={{ fontSize: 12.5, fontFamily: t.font.bodyBold, color: t.accent[700], letterSpacing: 0.6, textTransform: 'uppercase' }}>
            {todayDateLabel}
          </Text>
          <Text style={{ fontFamily: t.font.heading, fontSize: 30, color: t.text, marginTop: 2 }}>Bonjour {member?.name}</Text>
        </View>
        <Pressable onPress={() => setSettingsOpen(true)} style={{ marginTop: 2 }}>
          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: t.neutral[100], alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={20} color={t.text} strokeWidth={2.75} />
            {pendingTasksCount > 0 ? (
              <View
                style={{
                  position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, paddingHorizontal: 4,
                  borderRadius: 9, backgroundColor: t.accent[500], alignItems: 'center', justifyContent: 'center',
                  borderWidth: 2, borderColor: t.bg,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 10.5, fontFamily: t.font.bodyBold }}>{pendingTasksCount}</Text>
              </View>
            ) : null}
          </View>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 22, paddingVertical: 14 }}>
        <Card style={{ flex: 1, padding: 14 }} elevated>
          <Text style={{ fontFamily: t.font.heading, fontSize: 24, color: t.accent[700] }}>{pendingTasksCount}</Text>
          <Text style={{ fontSize: 12.5, color: t.accent[700], marginTop: 2 }}>tâches à faire</Text>
        </Card>
        <Card style={{ flex: 1, padding: 14, backgroundColor: t.accent2[100] }} elevated>
          <Text style={{ fontFamily: t.font.heading, fontSize: 24, color: t.accent2[700] }}>{mealsPlannedCount}/7</Text>
          <Text style={{ fontSize: 12.5, color: t.accent2[700], marginTop: 2 }}>repas planifiés</Text>
        </Card>
      </View>

      <Card style={{ marginHorizontal: 22, marginBottom: 16, padding: 16 }} elevated {...swipeHandlers}>
        <Text style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: t.accent[500], marginBottom: 4 }}>{homeDayLabel}</Text>
        {homeEvents.length === 0 && homeTasks.length === 0 ? (
          <Text style={{ paddingVertical: 10, color: t.neutral[600], fontSize: 14 }}>Rien de prévu ce jour-là.</Text>
        ) : null}
        {homeEvents.map((ev) => {
          const person = members.find((m) => m.id === ev.assigned_to) ?? null;
          return (
            <View key={ev.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: t.neutral[200] }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: personColor(person, t).bg }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, color: t.text, fontWeight: '600' }}>{ev.title}</Text>
                <Text style={{ fontSize: 12.5, color: t.neutral[600] }}>{ev.all_day ? 'Toute la journée' : ev.time}</Text>
              </View>
            </View>
          );
        })}
        {homeTasks.map((tk) => (
          <View key={tk.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: t.neutral[200] }}>
            <Checkbox checked={tk.completed} onPress={() => toggleTask(tk.id)} />
            <Text style={{ flex: 1, fontSize: 15, color: tk.completed ? t.neutral[600] : t.text, textDecorationLine: tk.completed ? 'line-through' : 'none' }}>
              {tk.title}
            </Text>
          </View>
        ))}
      </Card>

      <Card style={{ marginHorizontal: 22, marginBottom: 20, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' }} elevated>
        <View style={{ width: 60, height: 60, borderRadius: 14, backgroundColor: t.neutral[200], alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 10, color: t.neutral[600] }}>{tonightRecipe ? 'Repas' : ''}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: t.accent[500] }}>Ce soir</Text>
          <Text style={{ fontSize: 15.5, fontWeight: '600', color: t.text }} numberOfLines={1}>
            {tonightRecipe ? tonightRecipe.name : 'Aucun repas planifié'}
          </Text>
        </View>
      </Card>

      <Text style={{ paddingHorizontal: 22, paddingBottom: 10, fontFamily: t.font.heading, fontSize: 18, color: t.text }}>À faire bientôt</Text>
      <Card style={{ marginHorizontal: 22 }}>
        {upcomingTasks.length === 0 ? (
          <Text style={{ padding: 16, color: t.neutral[600], fontSize: 14 }}>Rien de prévu pour les prochains jours.</Text>
        ) : null}
        {upcomingTasks.map((tk, i) => {
          const person = members.find((m) => m.id === tk.assigned_to) ?? null;
          const meta = CATEGORY_META[tk.category];
          const dueDate = tk.due_date ? new Date(tk.due_date + 'T00:00:00') : null;
          return (
            <View
              key={tk.id}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12,
                borderBottomWidth: i === upcomingTasks.length - 1 ? 0 : 1, borderBottomColor: t.neutral[200],
              }}
            >
              <Checkbox checked={tk.completed} onPress={() => toggleTask(tk.id)} />
              <Avatar member={person} allMembers={members} onPress={() => updateTask(tk.id, { assigned_to: cyclePersonId(members, tk.assigned_to) })} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, color: t.text, fontWeight: '500' }}>{tk.title}</Text>
                <Text style={{ fontSize: 12, color: t.neutral[600], marginTop: 1 }}>
                  {dueDate ? `${dueDate.getDate()} ${MONTH_NAMES[dueDate.getMonth()]}${tk.due_time ? ', ' + tk.due_time : ''}` : personName(person)}
                </Text>
              </View>
              <Tag label={meta.label} variant={meta.tagClass} small />
            </View>
          );
        })}
      </Card>

      <SettingsHost visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Screen>
  );
}
