import React, { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Sheet, Card } from '../../components/ui';
import { AccountSheet } from './AccountSheet';
import { MembersSheet } from './MembersSheet';
import { NotificationsSheet } from './NotificationsSheet';
import { PreferencesSheet } from './PreferencesSheet';
import { ImportSheet } from './ImportSheet';

type SubSheet = 'account' | 'members' | 'notifications' | 'prefs' | 'import' | null;

export function SettingsHost({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useTheme();
  const [sub, setSub] = useState<SubSheet>(null);

  const rows: { key: SubSheet; label: string }[] = [
    { key: 'account', label: 'Mon compte' },
    { key: 'members', label: 'Membres de la famille' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'prefs', label: "Préférences de l'application" },
    { key: 'import', label: 'Importer' },
  ];

  return (
    <>
      <Sheet visible={visible && !sub} onClose={onClose} title="Paramètres">
        <Card>
          {rows.map((r, i) => (
            <Pressable
              key={r.key}
              onPress={() => setSub(r.key)}
              style={{ padding: 13, borderBottomWidth: i === rows.length - 1 ? 0 : 1, borderBottomColor: t.neutral[200] }}
            >
              <Text style={{ fontSize: 14, color: t.text }}>{r.label}</Text>
            </Pressable>
          ))}
        </Card>
      </Sheet>

      <AccountSheet visible={visible && sub === 'account'} onClose={() => setSub(null)} />
      <MembersSheet visible={visible && sub === 'members'} onClose={() => setSub(null)} />
      <NotificationsSheet visible={visible && sub === 'notifications'} onClose={() => setSub(null)} />
      <PreferencesSheet visible={visible && sub === 'prefs'} onClose={() => setSub(null)} />
      <ImportSheet visible={visible && sub === 'import'} onClose={() => setSub(null)} />
    </>
  );
}
