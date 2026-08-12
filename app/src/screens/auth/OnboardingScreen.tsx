import React, { useState } from 'react';
import { Text, ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../state/AuthContext';
import { Button, Field, Input } from '../../components/ui';

export function OnboardingScreen() {
  const t = useTheme();
  const { pendingInvite, createFamily, acceptInvite, signOut } = useAuth();
  const [familyName, setFamilyName] = useState('Ma famille');
  const [memberName, setMemberName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    const result = pendingInvite ? await acceptInvite(memberName) : await createFamily(familyName, memberName);
    setLoading(false);
    if (result.error) setError(result.error);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 28 }}>
      <Text style={{ fontFamily: t.font.heading, fontSize: 26, color: t.text, marginBottom: 6 }}>
        {pendingInvite ? `Rejoindre « ${pendingInvite.family_name} »` : 'Créer votre foyer'}
      </Text>
      <Text style={{ fontFamily: t.font.body, fontSize: 14, color: t.neutral[700], marginBottom: 24 }}>
        {pendingInvite
          ? "Vous avez été invité·e à rejoindre ce foyer. Confirmez votre prénom pour continuer."
          : 'Donnez un nom à votre foyer et le prénom qui vous identifiera dans l\'app.'}
      </Text>

      {!pendingInvite ? (
        <Field label="Nom du foyer" style={{ marginBottom: 14 }}>
          <Input value={familyName} onChangeText={setFamilyName} placeholder="Ex. Famille Tremblay" />
        </Field>
      ) : null}
      <Field label="Votre prénom" style={{ marginBottom: 20 }}>
        <Input value={memberName} onChangeText={setMemberName} placeholder="Ex. Alex" />
      </Field>

      {error ? <Text style={{ color: t.accent[700], fontSize: 13, marginBottom: 14 }}>{error}</Text> : null}

      <Button label={pendingInvite ? 'Rejoindre le foyer' : 'Créer le foyer'} onPress={submit} loading={loading} block disabled={!memberName.trim()} />
      <Button label="Se déconnecter" variant="ghost" onPress={() => signOut()} style={{ marginTop: 12 }} />
    </ScrollView>
  );
}
