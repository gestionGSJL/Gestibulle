import React, { useState } from 'react';
import { Text, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../state/AuthContext';
import { Button, Field, Input } from '../../components/ui';

export function SignUpScreen({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const t = useTheme();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setInfo(null);
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    setLoading(true);
    const { error: err } = await signUp(email.trim(), password);
    setLoading(false);
    if (err) setError(err);
    else setInfo('Compte créé. Vérifiez votre courriel si une confirmation est requise, puis connectez-vous.');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 28 }}>
        <Text style={{ fontFamily: t.font.heading, fontSize: 30, color: t.text, marginBottom: 6 }}>Créer un compte</Text>
        <Text style={{ fontFamily: t.font.body, fontSize: 14, color: t.neutral[700], marginBottom: 28 }}>
          Pour démarrer ou rejoindre votre foyer.
        </Text>

        <Field label="Courriel" style={{ marginBottom: 14 }}>
          <Input value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="vous@exemple.com" />
        </Field>
        <Field label="Mot de passe" style={{ marginBottom: 20 }}>
          <Input value={password} onChangeText={setPassword} secureTextEntry placeholder="Au moins 6 caractères" />
        </Field>

        {error ? <Text style={{ color: t.accent[700], fontSize: 13, marginBottom: 14 }}>{error}</Text> : null}
        {info ? <Text style={{ color: t.accent2[700], fontSize: 13, marginBottom: 14 }}>{info}</Text> : null}

        <Button label="Créer mon compte" onPress={submit} loading={loading} block />

        <Pressable onPress={onSwitchToSignIn} style={{ marginTop: 18, alignSelf: 'center' }}>
          <Text style={{ color: t.accent[700], fontFamily: t.font.bodySemiBold, fontSize: 13.5 }}>J'ai déjà un compte</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
