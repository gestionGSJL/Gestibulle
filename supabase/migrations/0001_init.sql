-- Gestion Familiale — initial schema
-- One family per user for v1 (a user belongs to exactly one family_members row).
-- Every domain table is scoped by family_id and gated by RLS so the two (or more)
-- members of a household see and edit the same shared data in real time.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- Core: families & members
-- ─────────────────────────────────────────────────────────────────────────

create table families (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Ma famille',
  created_at timestamptz not null default now()
);

-- One row per person in the household. user_id is null until an invite is accepted.
create table family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text,
  role text not null default 'member' check (role in ('owner', 'member')),
  color_index int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id)
);

create index family_members_family_id_idx on family_members(family_id);

create table invites (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  email text not null,
  invited_by uuid references family_members(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'cancelled')),
  created_at timestamptz not null default now()
);

create index invites_family_id_idx on invites(family_id);
create index invites_email_idx on invites(lower(email));

-- ─────────────────────────────────────────────────────────────────────────
-- Domain tables
-- ─────────────────────────────────────────────────────────────────────────

create table events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  title text not null,
  start_date date not null,
  end_date date not null,
  all_day boolean not null default false,
  time text, -- 'HH:MM' 24h, null when all_day
  assigned_to uuid references family_members(id) on delete set null, -- null = everyone
  reminders text[] not null default '{}',
  created_by uuid references family_members(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index events_family_id_idx on events(family_id);
create index events_date_range_idx on events(family_id, start_date, end_date);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  category text not null check (category in ('entretien', 'renovation', 'finances')),
  title text not null,
  due_date date,
  due_time text,
  assigned_to uuid references family_members(id) on delete set null, -- null = everyone
  completed boolean not null default false,
  completed_by uuid references family_members(id) on delete set null,
  completed_at date,
  reminders text[] not null default '{}',
  receipt_image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tasks_family_id_idx on tasks(family_id);
create index tasks_due_date_idx on tasks(family_id, due_date);

create table recipes (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  prep_time text not null default '',
  tag text not null default '',
  image_path text,
  ingredients text[] not null default '{}',
  is_favorite boolean not null default true,
  created_at timestamptz not null default now()
);
create index recipes_family_id_idx on recipes(family_id);

create table meal_plan (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  date date not null,
  recipe_id uuid references recipes(id) on delete set null,
  unique (family_id, date)
);
create index meal_plan_family_id_idx on meal_plan(family_id);

create table grocery_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  checked boolean not null default false,
  from_recipe boolean not null default false,
  created_at timestamptz not null default now()
);
create index grocery_items_family_id_idx on grocery_items(family_id);

create table notification_prefs (
  family_member_id uuid primary key references family_members(id) on delete cascade,
  enabled boolean not null default true,
  notif_rdv boolean not null default true,
  notif_taches boolean not null default true,
  notif_repas boolean not null default false,
  default_reminder text not null default '1d',
  expo_push_token text
);

create table app_prefs (
  family_id uuid primary key references families(id) on delete cascade,
  language text not null default 'fr' check (language in ('fr', 'en')),
  time_format text not null default '24h' check (time_format in ('24h', '12h')),
  week_start text not null default 'dimanche' check (week_start in ('dimanche', 'lundi')),
  sounds boolean not null default true,
  color_theme text not null default 'printanier' check (color_theme in ('printanier', 'sauge', 'lavande', 'ocean'))
);

-- ─────────────────────────────────────────────────────────────────────────
-- updated_at maintenance
-- ─────────────────────────────────────────────────────────────────────────

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger events_set_updated_at before update on events
  for each row execute function set_updated_at();
create trigger tasks_set_updated_at before update on tasks
  for each row execute function set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────

create or replace function current_family_id() returns uuid as $$
  select family_id from family_members where user_id = auth.uid() limit 1;
$$ language sql stable security definer set search_path = public;

alter table families enable row level security;
alter table family_members enable row level security;
alter table invites enable row level security;
alter table events enable row level security;
alter table tasks enable row level security;
alter table recipes enable row level security;
alter table meal_plan enable row level security;
alter table grocery_items enable row level security;
alter table notification_prefs enable row level security;
alter table app_prefs enable row level security;

create policy "family members can read their family" on families
  for select using (id = current_family_id());
create policy "owner can update their family" on families
  for update using (id = current_family_id());
create policy "authenticated users can create a family" on families
  for insert with check (auth.uid() is not null);

create policy "family members can read their household" on family_members
  for select using (family_id = current_family_id());
create policy "family members can update their household" on family_members
  for update using (family_id = current_family_id());
create policy "self can insert own membership row" on family_members
  for insert with check (user_id = auth.uid() or family_id = current_family_id());
create policy "family members can remove household members" on family_members
  for delete using (family_id = current_family_id());

create policy "family members can read invites" on invites
  for all using (family_id = current_family_id()) with check (family_id = current_family_id());

create policy "family members can read events" on events
  for select using (family_id = current_family_id());
create policy "family members can write events" on events
  for insert with check (family_id = current_family_id());
create policy "family members can update events" on events
  for update using (family_id = current_family_id());
create policy "family members can delete events" on events
  for delete using (family_id = current_family_id());

create policy "family members can read tasks" on tasks
  for select using (family_id = current_family_id());
create policy "family members can write tasks" on tasks
  for insert with check (family_id = current_family_id());
create policy "family members can update tasks" on tasks
  for update using (family_id = current_family_id());
create policy "family members can delete tasks" on tasks
  for delete using (family_id = current_family_id());

create policy "family members can read recipes" on recipes
  for all using (family_id = current_family_id()) with check (family_id = current_family_id());

create policy "family members can read meal_plan" on meal_plan
  for all using (family_id = current_family_id()) with check (family_id = current_family_id());

create policy "family members can read grocery_items" on grocery_items
  for all using (family_id = current_family_id()) with check (family_id = current_family_id());

create policy "member can manage own notification prefs" on notification_prefs
  for all using (family_member_id in (select id from family_members where family_id = current_family_id()))
  with check (family_member_id in (select id from family_members where family_id = current_family_id()));

create policy "family members can manage app_prefs" on app_prefs
  for all using (family_id = current_family_id()) with check (family_id = current_family_id());

-- ─────────────────────────────────────────────────────────────────────────
-- Realtime
-- ─────────────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table events, tasks, recipes, meal_plan, grocery_items, family_members, invites, app_prefs;
