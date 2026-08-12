import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useFamilyData } from '../../state/FamilyDataContext';
import { Sheet, Card, Toggle, Chip } from '../../components/ui';
import { REMINDER_META, ReminderKey } from '../../types/models';
import { registerForPushNotificationsAsync } from '../../lib/notifications';

const CATEGORIES: { key: 'notif_rdv' | 'notif_taches' | 'notif_repas'; label: string }[] = [
  { key: 'notif_rdv', label: 'Rendez-vous' },
  { key: 'notif_taches', label: 'Tâches' },
  { key: 'notif_repas', label: 'Rappels de repas' },
];

export function NotificationsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useTheme();
  const { notifPrefs, updateNotifPrefs } = useFamilyData();
  if (!notifPrefs) return null;

  const toggleMaster = async () => {
    const next = !notifPrefs.enabled;
    if (next) {
      const token = await registerForPushNotificationsAsync();
      await updateNotifPrefs({ enabled: next, expo_push_token: token ?? notifPrefs.expo_push_token });
    } else {
      await updateNotifPrefs({ enabled: next });
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Notifications">
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 13, borderBottomWidth: 1, borderBottomColor: t.neutral[200] }}>
          <Text style={{ fontSize: 14, color: t.text }}>Activer les notifications</Text>
          <Toggle value={notifPrefs.enabled} onChange={toggleMaster} />
        </View>
        {CATEGORIES.map((c) => (
          <View
            key={c.key}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 13,
              borderBottomWidth: 1, borderBottomColor: t.neutral[200], opacity: notifPrefs.enabled ? 1 : 0.45,
            }}
          >
            <Text style={{ fontSize: 14, color: t.text }}>{c.label}</Text>
            <Toggle
              value={notifPrefs[c.key]}
              disabled={!notifPrefs.enabled}
              onChange={() => updateNotifPrefs({ [c.key]: !notifPrefs[c.key] } as any)}
            />
          </View>
        ))}
        <View style={{ padding: 13 }}>
          <Text style={{ fontSize: 13, color: t.text, marginBottom: 8 }}>Rappel par défaut</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(Object.keys(REMINDER_META) as ReminderKey[]).map((key) => (
              <Chip
                key={key}
                label={REMINDER_META[key]}
                active={notifPrefs.default_reminder === key}
                onPress={() => updateNotifPrefs({ default_reminder: key })}
              />
            ))}
          </View>
        </View>
      </Card>
    </Sheet>
  );
}
