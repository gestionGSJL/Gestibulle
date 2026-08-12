// .ics import — ported from the prototype's handleIcsImport (Gestion Familiale.dc.html),
// keeping the same hard-won parsing rules:
//  - unfold RFC 5545 line continuations before splitting into VEVENT blocks
//  - all-day DTEND is exclusive (the day *after* the event ends) — roll back one day
//  - recurring events (RRULE) often encode their recurrence interval in DTEND,
//    not a real multi-day span — always import those as single-day
//  - "trash calendar" mode ignores DTEND entirely: source feeds sometimes encode
//    a multi-day *display window* for a single pickup day
import { addDays, toISO } from './dates';

export type IcsMode = 'calendar' | 'trash';
export type TrashReminderMode = 'none' | 'standard' | 'silent';

export interface ParsedIcsEvent {
  title: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
  time: string | null;
}

export interface ParsedIcsTask {
  title: string;
  due_date: string;
  due_time: string | null;
}

export interface ParseIcsResult {
  events: ParsedIcsEvent[];
  tasks: ParsedIcsTask[];
  message: string;
}

function parseDt(v: string): Date | null {
  const m = v.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/);
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 0, m[5] ? +m[5] : 0);
}

export function parseIcs(
  text: string,
  mode: IcsMode,
  trashReminderTime?: string,
  trashReminderMode?: TrashReminderMode
): ParseIcsResult {
  // unfold ICS line continuations (a leading space/tab means "join with previous line")
  const unfolded = text.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
  const blocks = unfolded.split('BEGIN:VEVENT').slice(1);

  const events: ParsedIcsEvent[] = [];
  const tasks: ParsedIcsTask[] = [];

  blocks.forEach((raw) => {
    const b = raw.split('END:VEVENT')[0];
    const summaryM = b.match(/SUMMARY:(.*)/);
    const dtStartM = b.match(/DTSTART[^:]*:(\S+)/);
    const dtStartFullM = b.match(/DTSTART([^:]*):(\S+)/);
    const dtEndFullM = b.match(/DTEND([^:]*):(\S+)/);
    const hasRRule = /\nRRULE:/.test('\n' + b);
    if (!summaryM || !dtStartM) return;

    const start = parseDt(dtStartM[1]);
    if (!start) return;
    const isAllDay = (dtStartFullM && /VALUE=DATE/.test(dtStartFullM[1])) || !/T/.test(dtStartM[1]);
    const hasTime = !isAllDay;
    const iso = toISO(start);
    const timeHHMM = hasTime ? `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}` : null;
    const title = summaryM[1].trim();

    if (mode === 'trash') {
      const wantsReminder = (trashReminderMode ?? 'none') !== 'none';
      tasks.push({
        title,
        due_date: iso,
        due_time: wantsReminder ? trashReminderTime ?? timeHHMM ?? null : null,
      });
    } else {
      let end = dtEndFullM ? parseDt(dtEndFullM[2]) : start;
      if (end && isAllDay) end = addDays(end, -1);
      let endDate = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate()) : new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      if (hasRRule || endDate < startDate) endDate = startDate;
      events.push({
        title,
        start_date: iso,
        end_date: toISO(endDate),
        all_day: isAllDay,
        time: timeHHMM ? timeHHMM : null,
      });
    }
  });

  const message =
    mode === 'trash'
      ? tasks.length ? `${tasks.length} tâche(s) importée(s).` : 'Aucun évènement trouvé dans ce fichier.'
      : events.length ? `${events.length} évènement(s) importé(s).` : 'Aucun évènement trouvé dans ce fichier.';

  return { events, tasks, message };
}
