# Gestion Familiale — Supabase backend

Schema, RLS policies, storage bucket, and the push-notification edge function
for the Gestion Familiale app (`../app`).

## Setup

1. Create a project at [supabase.com](https://supabase.com) (or run
   `supabase start` locally with the [Supabase CLI](https://supabase.com/docs/guides/cli)).
2. Run the migrations, in order, against your project — either:
   - **Dashboard**: paste each file in `migrations/` (in filename order) into
     the SQL Editor and run it, or
   - **CLI**: `supabase link --project-ref <your-ref>` then `supabase db push`.
3. Copy your project's URL and anon key (Project Settings → API) into
   `../app/.env` (see `../app/.env.example`).
4. That's it for a working app — auth, tables, RLS, realtime, and the
   `receipts` storage bucket are all created by the migrations.

## What's in the schema (`migrations/0001_init.sql`)

One `families` row per household; every domain table (`events`, `tasks`,
`recipes`, `meal_plan`, `grocery_items`) is scoped by `family_id` and gated
by Row Level Security so only that family's members can read or write it
(`current_family_id()` looks up the caller's `family_members` row via
`auth.uid()`). `family_members.user_id` is null until an invited member
accepts (see `0003_functions.sql`), and `assigned_to` on events/tasks is a
nullable `family_members` reference — null means "everyone".

`0002_storage.sql` creates a private `receipts` bucket for finance-task
payment-proof photos, path-scoped to `${family_id}/...`.

`0003_functions.sql` has the two RPCs the app's onboarding flow calls:
- `create_family_for_new_user(family_name, member_name)` — creates the
  family, the caller's `family_members` row as owner, seeds the 6 default
  favorite recipes, and default `app_prefs`/`notification_prefs`.
- `accept_invite(invite_id, member_name)` — turns a pending `invites` row
  into a `family_members` row for the caller.

## Cross-member push notifications (optional)

Local reminders (event/task reminders, trash-calendar due alerts) work
without any of this — they're scheduled on-device via `expo-notifications`.
This part is only for *cross-member* pushes, e.g. notifying "Julie" the
moment "Moi" completes a task:

1. Deploy the edge function:
   ```
   supabase functions deploy notify-family
   ```
2. In the Dashboard, go to **Database → Webhooks** and create two webhooks:
   - Table `tasks`, events `INSERT` + `UPDATE` → HTTP POST to the deployed
     `notify-family` function URL.
   - Table `events`, event `INSERT` → same function URL.
3. Make sure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set as
   secrets for the function (`supabase secrets set ...` — the service role
   key is required because the function reads `notification_prefs` across
   the whole family, bypassing RLS by design, server-side only).

Each family member's Expo push token is stored in
`notification_prefs.expo_push_token`, populated the first time they enable
notifications in Paramètres → Notifications (requires a physical device and
an EAS project ID — see Expo's push notification setup docs for
`eas.json`).
