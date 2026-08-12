import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { ReminderKey } from '../types/models';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const REMINDER_OFFSET_MS: Record<ReminderKey, number> = {
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '2d': 2 * 24 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000,
};

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  const granted = await ensureNotificationPermission();
  if (!granted) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  try {
    const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    return token.data;
  } catch (err) {
    console.warn('Could not get Expo push token (requires a physical device + EAS project):', err);
    return null;
  }
}

function notificationIdFor(entityType: 'event' | 'task', entityId: string, reminder: ReminderKey): string {
  return `${entityType}-${entityId}-${reminder}`;
}

/**
 * Reschedules every local reminder for an event or task: cancels any previously
 * scheduled notifications for this entity, then schedules one per reminder key
 * relative to its date/time. Notifications in the past are silently skipped.
 */
export async function rescheduleReminders(params: {
  entityType: 'event' | 'task';
  entityId: string;
  title: string;
  body: string;
  date: string | null; // ISO yyyy-mm-dd
  time: string | null; // HH:MM, defaults to 09:00 when absent
  reminders: ReminderKey[];
}) {
  const { entityType, entityId, title, body, date, time, reminders } = params;

  await Promise.all(
    (Object.keys(REMINDER_OFFSET_MS) as ReminderKey[]).map((key) =>
      Notifications.cancelScheduledNotificationAsync(notificationIdFor(entityType, entityId, key)).catch(() => {})
    )
  );

  if (!date || !reminders.length) return;
  const granted = await ensureNotificationPermission();
  if (!granted) return;

  const [h, m] = (time ?? '09:00').split(':').map(Number);
  const target = new Date(date + 'T00:00:00');
  target.setHours(h || 9, m || 0, 0, 0);

  for (const key of reminders) {
    const fireAt = new Date(target.getTime() - REMINDER_OFFSET_MS[key]);
    if (fireAt.getTime() <= Date.now()) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: notificationIdFor(entityType, entityId, key),
      content: { title, body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
    });
  }
}

/**
 * A same-day, at-due-time notification (not an offset-before reminder) — used
 * for imported "trash calendar" tasks, which want a heads-up right when the
 * bin needs to go out rather than N minutes/days ahead of it.
 */
export async function scheduleTaskDueNotification(params: {
  taskId: string;
  title: string;
  date: string;
  time: string;
  silent: boolean;
}) {
  const { taskId, title, date, time, silent } = params;
  const identifier = `task-due-${taskId}`;
  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});
  const granted = await ensureNotificationPermission();
  if (!granted) return;
  const [h, m] = time.split(':').map(Number);
  const fireAt = new Date(date + 'T00:00:00');
  fireAt.setHours(h || 0, m || 0, 0, 0);
  if (fireAt.getTime() <= Date.now()) return;
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title: 'Collecte', body: title, sound: silent ? undefined : 'default' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
  });
}

export async function cancelReminders(entityType: 'event' | 'task', entityId: string) {
  await Promise.all(
    (Object.keys(REMINDER_OFFSET_MS) as ReminderKey[]).map((key) =>
      Notifications.cancelScheduledNotificationAsync(notificationIdFor(entityType, entityId, key)).catch(() => {})
    )
  );
}
