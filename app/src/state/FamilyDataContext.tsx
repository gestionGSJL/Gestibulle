import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { cancelReminders } from '../lib/notifications';
import {
  FamilyMember, Invite, FamilyEvent, FamilyTask, Recipe, MealPlanEntry,
  GroceryItem, NotificationPrefs, AppPrefs,
} from '../types/models';

interface FamilyDataValue {
  loading: boolean;
  members: FamilyMember[];
  invites: Invite[];
  events: FamilyEvent[];
  tasks: FamilyTask[];
  recipes: Recipe[];
  mealPlan: MealPlanEntry[];
  groceryItems: GroceryItem[];
  appPrefs: AppPrefs | null;
  notifPrefs: NotificationPrefs | null;

  addEvent: (data: Partial<FamilyEvent> & { title: string; start_date: string; end_date: string }) => Promise<string | null>;
  updateEvent: (id: string, data: Partial<FamilyEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  bulkAddEvents: (rows: (Partial<FamilyEvent> & { title: string; start_date: string; end_date: string })[]) => Promise<number>;
  bulkAddTasks: (rows: (Partial<FamilyTask> & { title: string; category: FamilyTask['category'] })[]) => Promise<FamilyTask[]>;

  addTask: (data: Partial<FamilyTask> & { title: string; category: FamilyTask['category'] }) => Promise<string | null>;
  updateTask: (id: string, data: Partial<FamilyTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<{ openFinanceProof: boolean } >;

  setMeal: (date: string, recipeId: string | null) => Promise<void>;
  swapMeals: (dateA: string, dateB: string) => Promise<void>;

  addGroceryItem: (name: string) => Promise<void>;
  toggleGroceryItem: (id: string) => Promise<void>;
  removeGroceryItem: (id: string) => Promise<void>;
  clearCheckedGroceryItems: () => Promise<void>;
  addIngredientToGrocery: (name: string) => Promise<void>;

  updateMemberName: (id: string, name: string) => Promise<void>;
  sendInvite: (email: string) => Promise<void>;
  cancelInvite: (id: string) => Promise<void>;

  updateAppPrefs: (data: Partial<AppPrefs>) => Promise<void>;
  updateNotifPrefs: (data: Partial<NotificationPrefs>) => Promise<void>;

  uploadReceipt: (taskId: string, localUri: string) => Promise<void>;
  getReceiptSignedUrl: (path: string) => Promise<string | null>;
}

const FamilyDataContext = createContext<FamilyDataValue | null>(null);

export function FamilyDataProvider({ children }: { children: React.ReactNode }) {
  const { member } = useAuth();
  const familyId = member?.family_id ?? null;

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [tasks, setTasks] = useState<FamilyTask[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlanEntry[]>([]);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [appPrefs, setAppPrefs] = useState<AppPrefs | null>(null);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs | null>(null);

  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);

  useEffect(() => {
    if (!familyId || !member) {
      setMembers([]); setInvites([]); setEvents([]); setTasks([]); setRecipes([]);
      setMealPlan([]); setGroceryItems([]); setAppPrefs(null); setNotifPrefs(null);
      setLoading(false);
      return;
    }

    const memberId = member.id;
    let cancelled = false;
    setLoading(true);

    (async () => {
      const [membersRes, invitesRes, eventsRes, tasksRes, recipesRes, mealPlanRes, groceryRes, prefsRes, notifRes] = await Promise.all([
        supabase.from('family_members').select('*').eq('family_id', familyId).order('color_index'),
        supabase.from('invites').select('*').eq('family_id', familyId).eq('status', 'pending'),
        supabase.from('events').select('*').eq('family_id', familyId),
        supabase.from('tasks').select('*').eq('family_id', familyId),
        supabase.from('recipes').select('*').eq('family_id', familyId),
        supabase.from('meal_plan').select('*').eq('family_id', familyId),
        supabase.from('grocery_items').select('*').eq('family_id', familyId).order('created_at'),
        supabase.from('app_prefs').select('*').eq('family_id', familyId).maybeSingle(),
        supabase.from('notification_prefs').select('*').eq('family_member_id', member.id).maybeSingle(),
      ]);
      if (cancelled) return;
      setMembers((membersRes.data as FamilyMember[]) ?? []);
      setInvites((invitesRes.data as Invite[]) ?? []);
      setEvents((eventsRes.data as FamilyEvent[]) ?? []);
      setTasks((tasksRes.data as FamilyTask[]) ?? []);
      setRecipes((recipesRes.data as Recipe[]) ?? []);
      setMealPlan((mealPlanRes.data as MealPlanEntry[]) ?? []);
      setGroceryItems((groceryRes.data as GroceryItem[]) ?? []);
      setAppPrefs((prefsRes.data as AppPrefs) ?? null);
      setNotifPrefs((notifRes.data as NotificationPrefs) ?? null);
      setLoading(false);
    })();

    channelsRef.current.forEach((c) => supabase.removeChannel(c));
    channelsRef.current = [];

    function subscribe<T extends { id: string }>(
      table: string,
      setter: React.Dispatch<React.SetStateAction<T[]>>,
      matchKey: 'family_id' | 'family_member_id' = 'family_id'
    ) {
      const ch = supabase
        .channel(`${table}-${familyId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table, filter: `${matchKey}=eq.${matchKey === 'family_id' ? familyId : memberId}` },
          (payload) => {
            setter((prev) => {
              if (payload.eventType === 'INSERT') {
                if (prev.some((r) => r.id === (payload.new as any).id)) return prev;
                return [...prev, payload.new as T];
              }
              if (payload.eventType === 'UPDATE') {
                return prev.map((r) => (r.id === (payload.new as any).id ? (payload.new as T) : r));
              }
              if (payload.eventType === 'DELETE') {
                return prev.filter((r) => r.id !== (payload.old as any).id);
              }
              return prev;
            });
          }
        )
        .subscribe();
      channelsRef.current.push(ch);
    }

    subscribe<FamilyEvent>('events', setEvents);
    subscribe<FamilyTask>('tasks', setTasks);
    subscribe<Recipe>('recipes', setRecipes);
    subscribe<MealPlanEntry>('meal_plan', setMealPlan);
    subscribe<GroceryItem>('grocery_items', setGroceryItems);
    subscribe<FamilyMember>('family_members', setMembers);
    subscribe<Invite>('invites', setInvites);

    const appPrefsCh = supabase
      .channel(`app_prefs-${familyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_prefs', filter: `family_id=eq.${familyId}` }, (payload) => {
        if (payload.eventType !== 'DELETE') setAppPrefs(payload.new as AppPrefs);
      })
      .subscribe();
    channelsRef.current.push(appPrefsCh);

    return () => {
      cancelled = true;
      channelsRef.current.forEach((c) => supabase.removeChannel(c));
      channelsRef.current = [];
    };
  }, [familyId, member]);

  const addEvent: FamilyDataValue['addEvent'] = useCallback(
    async (data) => {
      if (!familyId) return null;
      const { data: row, error } = await supabase
        .from('events')
        .insert({ ...data, family_id: familyId, created_by: member?.id ?? null })
        .select()
        .single();
      if (error) { console.warn(error.message); return null; }
      setEvents((prev) => (prev.some((e) => e.id === row.id) ? prev : [...prev, row as FamilyEvent]));
      return row.id as string;
    },
    [familyId, member]
  );

  const updateEvent = useCallback(async (id: string, data: Partial<FamilyEvent>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
    const { error } = await supabase.from('events').update(data).eq('id', id);
    if (error) console.warn(error.message);
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) console.warn(error.message);
  }, []);

  const bulkAddEvents = useCallback(
    async (rows: (Partial<FamilyEvent> & { title: string; start_date: string; end_date: string })[]) => {
      if (!familyId || !rows.length) return 0;
      const { data, error } = await supabase
        .from('events')
        .insert(rows.map((r) => ({ ...r, family_id: familyId, created_by: member?.id ?? null })))
        .select();
      if (error) { console.warn(error.message); return 0; }
      setEvents((prev) => [...prev, ...((data as FamilyEvent[]) ?? [])]);
      return data?.length ?? 0;
    },
    [familyId, member]
  );

  const bulkAddTasks = useCallback(
    async (rows: (Partial<FamilyTask> & { title: string; category: FamilyTask['category'] })[]) => {
      if (!familyId || !rows.length) return [];
      const { data, error } = await supabase
        .from('tasks')
        .insert(rows.map((r) => ({ ...r, family_id: familyId })))
        .select();
      if (error) { console.warn(error.message); return []; }
      const inserted = (data as FamilyTask[]) ?? [];
      setTasks((prev) => [...prev, ...inserted]);
      return inserted;
    },
    [familyId]
  );

  const addTask: FamilyDataValue['addTask'] = useCallback(
    async (data) => {
      if (!familyId) return null;
      const { data: row, error } = await supabase
        .from('tasks')
        .insert({ ...data, family_id: familyId })
        .select()
        .single();
      if (error) { console.warn(error.message); return null; }
      setTasks((prev) => (prev.some((t) => t.id === row.id) ? prev : [...prev, row as FamilyTask]));
      return row.id as string;
    },
    [familyId]
  );

  const updateTask = useCallback(async (id: string, data: Partial<FamilyTask>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    const { error } = await supabase.from('tasks').update(data).eq('id', id);
    if (error) console.warn(error.message);
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) console.warn(error.message);
  }, []);

  const toggleTask = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return { openFinanceProof: false };
      const willComplete = !task.completed;
      const patch: Partial<FamilyTask> = {
        completed: willComplete,
        completed_by: willComplete ? member?.id ?? null : null,
        completed_at: willComplete ? new Date().toISOString().slice(0, 10) : null,
      };
      await updateTask(id, patch);
      // Completed ahead of its due date/time — the scheduled reminder would otherwise
      // still fire later for a task that's already done.
      if (willComplete) await cancelReminders('task', id);
      return { openFinanceProof: willComplete && task.category === 'finances' };
    },
    [tasks, member, updateTask]
  );

  const setMeal = useCallback(
    async (date: string, recipeId: string | null) => {
      if (!familyId) return;
      setMealPlan((prev) => {
        const existing = prev.find((m) => m.date === date);
        if (existing) return prev.map((m) => (m.date === date ? { ...m, recipe_id: recipeId } : m));
        return [...prev, { id: `optimistic-${date}`, family_id: familyId, date, recipe_id: recipeId }];
      });
      const { error } = await supabase.from('meal_plan').upsert(
        { family_id: familyId, date, recipe_id: recipeId },
        { onConflict: 'family_id,date' }
      );
      if (error) console.warn(error.message);
    },
    [familyId]
  );

  const swapMeals = useCallback(
    async (dateA: string, dateB: string) => {
      if (dateA === dateB) return;
      const a = mealPlan.find((m) => m.date === dateA)?.recipe_id ?? null;
      const b = mealPlan.find((m) => m.date === dateB)?.recipe_id ?? null;
      await Promise.all([setMeal(dateA, b), setMeal(dateB, a)]);
    },
    [mealPlan, setMeal]
  );

  const addGroceryItem = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed || !familyId) return;
      const { data: row, error } = await supabase
        .from('grocery_items')
        .insert({ family_id: familyId, name: trimmed, from_recipe: false })
        .select()
        .single();
      if (error) { console.warn(error.message); return; }
      setGroceryItems((prev) => (prev.some((g) => g.id === row.id) ? prev : [...prev, row as GroceryItem]));
    },
    [familyId]
  );

  const toggleGroceryItem = useCallback(
    async (id: string) => {
      const item = groceryItems.find((g) => g.id === id);
      if (!item) return;
      setGroceryItems((prev) => prev.map((g) => (g.id === id ? { ...g, checked: !g.checked } : g)));
      const { error } = await supabase.from('grocery_items').update({ checked: !item.checked }).eq('id', id);
      if (error) console.warn(error.message);
    },
    [groceryItems]
  );

  const removeGroceryItem = useCallback(async (id: string) => {
    setGroceryItems((prev) => prev.filter((g) => g.id !== id));
    const { error } = await supabase.from('grocery_items').delete().eq('id', id);
    if (error) console.warn(error.message);
  }, []);

  const clearCheckedGroceryItems = useCallback(async () => {
    const checkedIds = groceryItems.filter((g) => g.checked).map((g) => g.id);
    if (!checkedIds.length) return;
    setGroceryItems((prev) => prev.filter((g) => !g.checked));
    const { error } = await supabase.from('grocery_items').delete().in('id', checkedIds);
    if (error) console.warn(error.message);
  }, [groceryItems]);

  const addIngredientToGrocery = useCallback(
    async (name: string) => {
      if (groceryItems.some((g) => g.name.toLowerCase() === name.toLowerCase())) return;
      if (!familyId) return;
      const { data: row, error } = await supabase
        .from('grocery_items')
        .insert({ family_id: familyId, name, from_recipe: true })
        .select()
        .single();
      if (error) { console.warn(error.message); return; }
      setGroceryItems((prev) => (prev.some((g) => g.id === row.id) ? prev : [...prev, row as GroceryItem]));
    },
    [familyId, groceryItems]
  );

  const updateMemberName = useCallback(async (id: string, name: string) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, name } : m)));
    const { error } = await supabase.from('family_members').update({ name }).eq('id', id);
    if (error) console.warn(error.message);
  }, []);

  const sendInvite = useCallback(
    async (email: string) => {
      const trimmed = email.trim();
      if (!trimmed || !familyId) return;
      const { data: row, error } = await supabase
        .from('invites')
        .insert({ family_id: familyId, email: trimmed, invited_by: member?.id ?? null })
        .select()
        .single();
      if (error) { console.warn(error.message); return; }
      setInvites((prev) => (prev.some((i) => i.id === row.id) ? prev : [...prev, row as Invite]));
    },
    [familyId, member]
  );

  const cancelInvite = useCallback(async (id: string) => {
    setInvites((prev) => prev.filter((i) => i.id !== id));
    const { error } = await supabase.from('invites').update({ status: 'cancelled' }).eq('id', id);
    if (error) console.warn(error.message);
  }, []);

  const updateAppPrefs = useCallback(
    async (data: Partial<AppPrefs>) => {
      if (!familyId) return;
      setAppPrefs((prev) => (prev ? { ...prev, ...data } : prev));
      const { error } = await supabase.from('app_prefs').update(data).eq('family_id', familyId);
      if (error) console.warn(error.message);
    },
    [familyId]
  );

  const updateNotifPrefs = useCallback(
    async (data: Partial<NotificationPrefs>) => {
      if (!member) return;
      setNotifPrefs((prev) => (prev ? { ...prev, ...data } : prev));
      const { error } = await supabase.from('notification_prefs').update(data).eq('family_member_id', member.id);
      if (error) console.warn(error.message);
    },
    [member]
  );

  const uploadReceipt = useCallback(
    async (taskId: string, localUri: string) => {
      if (!familyId) return;
      const ext = localUri.split('.').pop() || 'jpg';
      const path = `${familyId}/${taskId}-${Date.now()}.${ext}`;
      const response = await fetch(localUri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const { error: uploadError } = await supabase.storage.from('receipts').upload(path, arrayBuffer, {
        contentType: blob.type || 'image/jpeg',
      });
      if (uploadError) { console.warn(uploadError.message); return; }
      await updateTask(taskId, { receipt_image_path: path });
    },
    [familyId, updateTask]
  );

  const getReceiptSignedUrl = useCallback(async (path: string) => {
    const { data, error } = await supabase.storage.from('receipts').createSignedUrl(path, 60 * 30);
    if (error) { console.warn(error.message); return null; }
    return data.signedUrl;
  }, []);

  const value = useMemo<FamilyDataValue>(
    () => ({
      loading, members, invites, events, tasks, recipes, mealPlan, groceryItems, appPrefs, notifPrefs,
      addEvent, updateEvent, deleteEvent, bulkAddEvents, bulkAddTasks,
      addTask, updateTask, deleteTask, toggleTask,
      setMeal, swapMeals,
      addGroceryItem, toggleGroceryItem, removeGroceryItem, clearCheckedGroceryItems, addIngredientToGrocery,
      updateMemberName, sendInvite, cancelInvite,
      updateAppPrefs, updateNotifPrefs,
      uploadReceipt, getReceiptSignedUrl,
    }),
    [
      loading, members, invites, events, tasks, recipes, mealPlan, groceryItems, appPrefs, notifPrefs,
      addEvent, updateEvent, deleteEvent, bulkAddEvents, bulkAddTasks,
      addTask, updateTask, deleteTask, toggleTask, setMeal, swapMeals,
      addGroceryItem, toggleGroceryItem, removeGroceryItem, clearCheckedGroceryItems, addIngredientToGrocery,
      updateMemberName, sendInvite, cancelInvite, updateAppPrefs, updateNotifPrefs, uploadReceipt, getReceiptSignedUrl,
    ]
  );

  return <FamilyDataContext.Provider value={value}>{children}</FamilyDataContext.Provider>;
}

export function useFamilyData() {
  const ctx = useContext(FamilyDataContext);
  if (!ctx) throw new Error('useFamilyData must be used within FamilyDataProvider');
  return ctx;
}
