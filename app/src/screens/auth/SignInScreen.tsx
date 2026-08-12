import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../state/AuthContext';
import { Button, Field, Input } from '../../components/ui';

export function SignInScreen({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const t = useTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 28 }}>
        <Text style={{ fontFamily: t.font.heading, fontSize: 30, color: t.text, marginBottom: 6 }}>Gestion Familiale</Text>
        <Text style={{ fontFamily: t.font.body, fontSize: 14, color: t.neutral[700], marginBottom: 28 }}>
          Connectez-vous pour retrouver votre foyer.
        </Text>

        <Field label="Courriel" style={{ marginBottom: 14 }}>
          <Input value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="vous@exemple.com" />
        </Field>
        <Field label="Mot de passe" style={{ marginBottom: 20 }}>
          <Input value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
        </Field>

        {error ? <Text style={{ color: t.accent[700], fontSize: 13, marginBottom: 14 }}>{error}</Text> : null}

        <Button label="Se connecter" onPress={submit} loading={loading} block />

        <Pressable onPress={onSwitchToSignUp} style={{ marginTop: 18, alignSelf: 'center' }}>
          <Text style={{ color: t.accent[700], fontFamily: t.font.bodySemiBold, fontSize: 13.5 }}>Créer un compte</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
