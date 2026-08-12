import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useFamilyData } from '../../state/FamilyDataContext';
import { Sheet, Card, Field, Input, Button, Avatar } from '../../components/ui';

export function MembersSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useTheme();
  const { members, invites, updateMemberName, sendInvite, cancelInvite } = useFamilyData();
  const [inviteEmail, setInviteEmail] = useState('');

  return (
    <Sheet visible={visible} onClose={onClose} title="Membres de la famille">
      <Card style={{ marginBottom: 20 }}>
        {members.map((m, i) => (
          <View
            key={m.id}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13,
              borderBottomWidth: i === members.length - 1 ? 0 : 1, borderBottomColor: t.neutral[200],
            }}
          >
            <Avatar member={m} allMembers={members} size={32} />
            <Input value={m.name} onChangeText={(v) => updateMemberName(m.id, v)} style={{ flex: 1 }} />
            <Text style={{ fontSize: 11.5, color: t.neutral[600] }}>{m.role === 'owner' ? 'Vous' : 'Membre'}</Text>
          </View>
        ))}
      </Card>

      <Text style={{ fontSize: 12.5, fontFamily: t.font.bodySemiBold, color: t.neutral[700], marginBottom: 8 }}>Inviter un membre</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <Input
          value={inviteEmail}
          onChangeText={setInviteEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="courriel@exemple.com"
          style={{ flex: 1 }}
        />
        <Button
          label="Inviter"
          onPress={() => { if (inviteEmail.trim()) { sendInvite(inviteEmail.trim()); setInviteEmail(''); } }}
        />
      </View>

      {invites.length > 0 ? (
        <>
          <Text style={{ fontSize: 12.5, fontFamily: t.font.bodySemiBold, color: t.neutral[700], marginBottom: 8 }}>
            Invitations en attente
          </Text>
          {invites.map((inv) => (
            <View
              key={inv.id}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: t.neutral[200],
              }}
            >
              <Text style={{ fontSize: 13.5, color: t.text }}>{inv.email}</Text>
              <Pressable onPress={() => cancelInvite(inv.id)}>
                <Text style={{ fontSize: 12, color: t.accent[700], fontFamily: t.font.bodySemiBold }}>Annuler</Text>
              </Pressable>
            </View>
          ))}
        </>
      ) : null}
    </Sheet>
  );
}
