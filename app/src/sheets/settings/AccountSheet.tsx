import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../state/AuthContext';
import { useFamilyData } from '../../state/FamilyDataContext';
import { Sheet, Field, Input, Button } from '../../components/ui';
import { supabase } from '../../lib/supabase';

export function AccountSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useTheme();
  const { member, session, signOut } = useAuth();
  const { updateMemberName } = useFamilyData();

  const [name, setName] = useState(member?.name ?? '');
  const [email, setEmail] = useState(session?.user.email ?? '');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setName(member?.name ?? '');
      setEmail(session?.user.email ?? '');
      setStatus(null);
      setShowPasswordField(false);
      setNewPassword('');
    }
  }, [visible, member, session]);

  const save = async () => {
    if (member && name.trim() && name.trim() !== member.name) {
      await updateMemberName(member.id, name.trim());
    }
    if (email.trim() && email.trim() !== session?.user.email) {
      const { error } = await supabase.auth.updateUser({ email: email.trim() });
      if (error) { setStatus(error.message); return; }
    }
    onClose();
  };

  const changePassword = async () => {
    if (newPassword.length < 6) { setStatus('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setStatus(error ? error.message : 'Mot de passe mis à jour.');
    if (!error) { setShowPasswordField(false); setNewPassword(''); }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Mon compte">
      <Field label="Nom" style={{ marginBottom: 14 }}>
        <Input value={name} onChangeText={setName} />
      </Field>
      <Field label="Courriel" style={{ marginBottom: 20 }}>
        <Input value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      </Field>

      {status ? <Text style={{ fontSize: 12.5, color: t.accent[700], marginBottom: 12 }}>{status}</Text> : null}

      <Button label="Enregistrer" onPress={save} block style={{ marginBottom: 20 }} />

      <Text style={{ fontSize: 12.5, fontFamily: t.font.bodySemiBold, color: t.neutral[700], marginBottom: 8 }}>Mot de passe</Text>
      {showPasswordField ? (
        <View style={{ marginBottom: 20 }}>
          <Input value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="Nouveau mot de passe" style={{ marginBottom: 10 }} />
          <Button label="Confirmer le nouveau mot de passe" onPress={changePassword} block />
        </View>
      ) : (
        <Button label="Changer le mot de passe" variant="secondary" onPress={() => setShowPasswordField(true)} block style={{ marginBottom: 20 }} />
      )}

      <Button label="Se déconnecter" variant="ghost" onPress={() => signOut()} block />
    </Sheet>
  );
}
