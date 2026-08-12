// Supabase Edge Function: notify-family
//
// Wire this up as the target of Database Webhooks (Database → Webhooks in the
// Supabase dashboard) on INSERT/UPDATE of `tasks` and `events`. It pushes an
// Expo notification to every *other* member of the family than whoever made
// the change, so e.g. "Julie" hears immediately when "Moi" completes a task.
//
// Payload shape follows Supabase's webhook convention:
// { type: 'INSERT'|'UPDATE'|'DELETE', table: string, record: {...}, old_record: {...} }

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const { table, type, record, old_record } = payload as {
      table: string;
      type: 'INSERT' | 'UPDATE' | 'DELETE';
      record: Record<string, any>;
      old_record?: Record<string, any>;
    };

    if (!record?.family_id) return new Response('ok', { status: 200 });

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    let title = '';
    let body = '';
    if (table === 'tasks' && type === 'UPDATE' && record.completed && !old_record?.completed) {
      const { data: member } = await supabase
        .from('family_members')
        .select('name')
        .eq('id', record.completed_by)
        .maybeSingle();
      title = 'Tâche complétée';
      body = `${member?.name ?? 'Quelqu\'un'} a complété : ${record.title}`;
    } else if (table === 'tasks' && type === 'INSERT') {
      title = 'Nouvelle tâche';
      body = record.title;
    } else if (table === 'events' && type === 'INSERT') {
      title = 'Nouveau rendez-vous';
      body = record.title;
    } else {
      return new Response('ok', { status: 200 });
    }

    const { data: members } = await supabase
      .from('family_members')
      .select('id, notification_prefs(enabled, notif_taches, notif_rdv, expo_push_token)')
      .eq('family_id', record.family_id);

    const category = table === 'tasks' ? 'notif_taches' : 'notif_rdv';
    const messages = (members ?? [])
      .filter((m: any) => m.id !== record.completed_by && m.id !== record.created_by)
      .map((m: any) => m.notification_prefs)
      .flat()
      .filter((p: any) => p?.enabled && p?.[category] && p?.expo_push_token)
      .map((p: any) => ({ to: p.expo_push_token, sound: 'default', title, body }));

    if (messages.length) {
      await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(messages),
      });
    }

    return new Response('ok', { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response('error', { status: 500 });
  }
});
