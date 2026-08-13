import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Receipt, Plus } from 'lucide-react-native';
import { Screen } from '../components/Screen';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../state/AuthContext';
import { useFamilyData } from '../state/FamilyDataContext';
import { Card, Tag, Checkbox, Chip, Avatar } from '../components/ui';
import { CATEGORY_META, TaskCategory, FamilyTask } from '../types/models';
import { MONTH_NAMES } from '../lib/dates';
import { cyclePersonId } from '../lib/people';
import { AddEditTaskSheet } from '../sheets/AddEditTaskSheet';
import { FinanceProofPromptSheet } from '../sheets/FinanceProofPromptSheet';
import { ReceiptViewerSheet } from '../sheets/ReceiptViewerSheet';

type Filter = 'all' | 'pending' | 'done';
const CATEGORY_KEYS = Object.keys(CATEGORY_META) as TaskCategory[];

export function TasksScreen() {
  const t = useTheme();
  const { member } = useAuth();
  const { members, tasks, toggleTask, updateTask } = useFamilyData();
  const [filter, setFilter] = useState<Filter>('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<FamilyTask | null>(null);
  const [financeProofTaskId, setFinanceProofTaskId] = useState<string | null>(null);
  const [receiptPath, setReceiptPath] = useState<string | null>(null);

  const filtered = useMemo(
    () => tasks.filter((tk) => (filter === 'done' ? tk.completed : filter === 'pending' ? !tk.completed : true)),
    [tasks, filter]
  );

  const onToggle = async (task: FamilyTask) => {
    const { openFinanceProof } = await toggleTask(task.id);
    if (openFinanceProof) setFinanceProofTaskId(task.id);
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 22, paddingBottom: 4 }}>
        <Text style={{ fontFamily: t.font.heading, fontSize: 28, color: t.text }}>Tâches</Text>
        <Pressable
          onPress={() => { setEditingTask(null); setSheetOpen(true); }}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: t.accent[500], alignItems: 'center', justifyContent: 'center' }}
        >
          <Plus size={20} color="#fff" strokeWidth={2.75} />
        </Pressable>
      </View>
      <Text style={{ paddingHorizontal: 22, paddingBottom: 14, fontSize: 13, color: t.neutral[700] }}>Connecté en tant que {member?.name}</Text>

      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 22, paddingBottom: 14 }}>
        <Chip label="Tout" active={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip label="Non terminées" active={filter === 'pending'} onPress={() => setFilter('pending')} />
        <Chip label="Terminées" active={filter === 'done'} onPress={() => setFilter('done')} />
      </View>

      {CATEGORY_KEYS.map((catKey) => {
        const catTasks = filtered.filter((tk) => tk.category === catKey);
        if (!catTasks.length) return null;
        return (
          <View key={catKey}>
            <Text style={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 8, fontFamily: t.font.heading, fontSize: 16, color: t.accent[700] }}>
              {CATEGORY_META[catKey].label}
            </Text>
            <Card style={{ marginHorizontal: 22 }}>
              {catTasks.map((tk, i) => {
                const person = members.find((m) => m.id === tk.assigned_to) ?? null;
                const completedByMember = tk.completed_by ? members.find((m) => m.id === tk.completed_by) : null;
                const dueDate = tk.due_date ? new Date(tk.due_date + 'T00:00:00') : null;
                const metaLabel = tk.completed
                  ? `Fait par ${completedByMember?.name ?? '?'}${tk.completed_at ? ' le ' + new Date(tk.completed_at + 'T00:00:00').getDate() + ' ' + MONTH_NAMES[new Date(tk.completed_at + 'T00:00:00').getMonth()] : ''}`
                  : dueDate
                  ? `${dueDate.getDate()} ${MONTH_NAMES[dueDate.getMonth()]}${tk.due_time ? ', ' + tk.due_time : ''}`
                  : 'Sans échéance';
                return (
                  <View
                    key={tk.id}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13,
                      borderBottomWidth: i === catTasks.length - 1 ? 0 : 1, borderBottomColor: t.neutral[200],
                    }}
                  >
                    <Checkbox checked={tk.completed} onPress={() => onToggle(tk)} />
                    <Avatar member={person} allMembers={members} onPress={() => updateTask(tk.id, { assigned_to: cyclePersonId(members, tk.assigned_to) })} />
                    <Pressable style={{ flex: 1 }} onPress={() => { setEditingTask(tk); setSheetOpen(true); }}>
                      <Text
                        style={{
                          fontSize: 15, color: tk.completed ? t.neutral[600] : t.text, fontWeight: tk.completed ? '400' : '500',
                          textDecorationLine: tk.completed ? 'line-through' : 'none',
                        }}
                      >
                        {tk.title}
                      </Text>
                      <Text style={{ fontSize: 12, color: t.neutral[600], marginTop: 1 }}>{metaLabel}</Text>
                    </Pressable>
                    {tk.receipt_image_path ? (
                      <Pressable
                        onPress={() => setReceiptPath(tk.receipt_image_path)}
                        style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: t.accent[100], alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Receipt size={15} color={t.accent[600]} strokeWidth={2.5} />
                      </Pressable>
                    ) : null}
                  </View>
                );
              })}
            </Card>
          </View>
        );
      })}

      <AddEditTaskSheet visible={sheetOpen} onClose={() => { setSheetOpen(false); setEditingTask(null); }} editingTask={editingTask} />
      <FinanceProofPromptSheet visible={!!financeProofTaskId} taskId={financeProofTaskId} onClose={() => setFinanceProofTaskId(null)} />
      <ReceiptViewerSheet visible={!!receiptPath} imagePath={receiptPath} onClose={() => setReceiptPath(null)} />
    </Screen>
  );
}
