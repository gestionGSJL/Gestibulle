export type ReminderKey = '15m' | '1h' | '1d' | '2d' | '1w';

export const REMINDER_META: Record<ReminderKey, string> = {
  '15m': '15 min avant',
  '1h': '1 h avant',
  '1d': '1 jour avant',
  '2d': '2 jours avant',
  '1w': '1 semaine avant',
};

export type TaskCategory = 'entretien' | 'renovation' | 'finances';

export const CATEGORY_META: Record<TaskCategory, { label: string; tagClass: 'tag-accent-2' | 'tag-outline' | 'tag-neutral' }> = {
  entretien: { label: 'Entretien', tagClass: 'tag-accent-2' },
  renovation: { label: 'Rénovation', tagClass: 'tag-outline' },
  finances: { label: 'Finances', tagClass: 'tag-neutral' },
};

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  role: 'owner' | 'member';
  color_index: number;
}

export interface Invite {
  id: string;
  family_id: string;
  email: string;
  status: 'pending' | 'accepted' | 'cancelled';
  created_at: string;
}

export interface FamilyEvent {
  id: string;
  family_id: string;
  title: string;
  start_date: string; // ISO date
  end_date: string; // ISO date
  all_day: boolean;
  time: string | null; // HH:MM
  assigned_to: string | null; // family_member id, null = everyone
  reminders: ReminderKey[];
  created_by: string | null;
}

export interface FamilyTask {
  id: string;
  family_id: string;
  category: TaskCategory;
  title: string;
  due_date: string | null;
  due_time: string | null;
  assigned_to: string | null; // null = everyone
  completed: boolean;
  completed_by: string | null;
  completed_at: string | null;
  reminders: ReminderKey[];
  receipt_image_path: string | null;
}

export interface Recipe {
  id: string;
  family_id: string;
  name: string;
  prep_time: string;
  tag: string;
  image_path: string | null;
  ingredients: string[];
}

export interface MealPlanEntry {
  id: string;
  family_id: string;
  date: string;
  recipe_id: string | null;
}

export interface GroceryItem {
  id: string;
  family_id: string;
  name: string;
  checked: boolean;
  from_recipe: boolean;
}

export interface NotificationPrefs {
  family_member_id: string;
  enabled: boolean;
  notif_rdv: boolean;
  notif_taches: boolean;
  notif_repas: boolean;
  default_reminder: ReminderKey;
  expo_push_token: string | null;
}

export type ColorTheme = 'printanier' | 'sauge' | 'lavande' | 'ocean';

export interface AppPrefs {
  family_id: string;
  language: 'fr' | 'en';
  time_format: '24h' | '12h';
  week_start: 'dimanche' | 'lundi';
  sounds: boolean;
  color_theme: ColorTheme;
}

// A person option used across pickers: a real family member, or "everyone".
export interface PersonOption {
  key: string | null; // family_member id, or null for "everyone"
  label: string;
}
