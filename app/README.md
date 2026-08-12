# Gestion Familiale

React Native (Expo) implementation of the "Gestion Familiale" design handoff
(`project/design_handoff_gestion_familiale/Gestion Familiale.dc.html`): a
shared family app with a calendar, recurring tasks/bills with payment-proof
photos, AI-assisted weekly meal planning, a grocery list linked to recipes,
and settings (family members, notifications, app preferences incl. 4 color
palettes, .ics calendar import).

Backed by Supabase (Postgres + Auth + Realtime + Storage) so both members of
a household see the same shared, live-synced data — see `../supabase/README.md`
for backend setup.

## Setup

1. **Backend first** — follow `../supabase/README.md` to create the Supabase
   project, run the migrations, and deploy the `notify-family` edge function.
2. Copy the env template and fill in your Supabase project's URL/anon key:
   ```
   cp .env.example .env
   ```
3. Install dependencies (already done if you just cloned):
   ```
   npm install
   ```
4. Start the app:
   ```
   npm start
   ```
   Then open in Expo Go, an iOS/Android simulator, or press `w` for web
   (web needs `npx expo install react-dom react-native-web` first — the app
   targets iOS/Android primarily).

## Architecture

- `src/theme/` — the Organic design system's tokens (`tokens.ts`, ported
  from `project/_ds/organic-.../styles.css`) plus the 4 in-app color
  palettes (Printanier/Sauge/Lavande/Océan) and a `ThemeContext` that can
  swap between them live, synced from `app_prefs.color_theme` (`ThemeSync.tsx`).
- `src/components/ui/` — a small component kit matching the Organic classes
  (`.btn`, `.tag`, `.card`, `.field`/`.input`, `.seg`, sheets/dialogs, etc).
- `src/state/AuthContext.tsx` — Supabase session, the signed-in user's
  `family_members` row, and the create-family / accept-invite onboarding flow.
- `src/state/FamilyDataContext.tsx` — all shared family data (events, tasks,
  recipes, meal plan, grocery list, members, invites, prefs) with Supabase
  CRUD + Realtime subscriptions so both members' devices stay in sync.
- `src/lib/` — pure helpers ported from the prototype's logic: `dates.ts`
  (date math), `ics.ts` (the .ics import parser, including the all-day/RRULE
  edge cases the original prototype had to work through), `notifications.ts`
  (local reminder scheduling + Expo push token registration), `people.ts`
  (person colors/initials/assignment cycling).
- `src/screens/` — the 5 tab screens (Accueil, Calendrier, Tâches, Repas,
  Épicerie) plus the auth/onboarding screens.
- `src/sheets/` — the bottom-sheet modals (add/edit event & task, recipe
  picker/AI-suggest/detail, receipt viewer, finance-proof prompt) and
  `sheets/settings/` for the Paramètres sub-sheets (account, family members,
  notifications, preferences, import).

## Known simplifications vs. the prototype

- **Recipe/meal photos**: the prototype used drag-and-drop placeholder image
  slots for design purposes. This build shows a placeholder icon instead of
  photos; wire up `recipes.image_path` + Supabase Storage (same pattern as
  receipt photos) if/when real recipe photography is available.
- **Meal-plan reordering**: implemented as long-press-then-tap-to-swap
  instead of native drag-and-drop, per the handoff doc's own stated
  fallback ("drag-and-drop (ou swap au clic)").
- **Cross-device push notifications**: local reminders (event/task reminders,
  trash-calendar due notifications) work out of the box via
  `expo-notifications`. Cross-member push (e.g. "Julie" being notified when
  "Moi" completes a task) requires deploying the `notify-family` edge
  function and wiring it to Database Webhooks — see `../supabase/README.md`.
  Push tokens only register once a member turns on notifications and only
  work on a physical device with an EAS project configured
  (`eas.json` / `expo.extra.eas.projectId`), not in Expo Go's dev client.
- **"Vous deux" / "Tout le monde"**: the prototype hard-codes exactly two
  people (Moi/Julie). This build generalizes to any number of invited family
  members; `assigned_to = null` means "everyone" wherever the prototype used
  `'both'`.
