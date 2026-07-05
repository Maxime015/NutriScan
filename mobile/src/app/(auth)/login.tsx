import { Link } from 'expo-router';
import { Leaf, Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { z } from 'zod';

import { AuthOrbs } from '../../components/ui/AuthOrbs';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Screen } from '../../components/ui/Screen';
import { useAuth } from '../../lib/auth';
import { colors } from '../../lib/theme';

const schema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(6, 'Au moins 6 caractères'),
});

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setFormError(null);
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        fieldErrors[i.path[0] as string] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await signIn(email, password);
      // La redirection est gérée par l'AuthGate.
    } catch (e: any) {
      setFormError(
        e?.message === 'Invalid login credentials'
          ? 'E-mail ou mot de passe incorrect.'
          : (e?.message ?? 'Connexion impossible.')
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <AuthOrbs />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.duration(500)} className="items-center mb-6">
            <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-4">
              <Leaf size={32} color="#052e16" />
            </View>
            <Text className="text-ink text-3xl font-extrabold">NutriScan</Text>
            <Text className="text-muted text-base mt-1">Analysez. Comprenez. Mangez mieux.</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(500).delay(150)} className="gap-4">
            <Text className="text-ink text-xl font-bold mb-1">Bon retour 👋</Text>

            <Input
              label="E-mail"
              placeholder="vous@exemple.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              icon={<Mail size={20} color={colors.subtle} />}
            />
            <Input
              label="Mot de passe"
              placeholder="••••••••"
              secure
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              icon={<Lock size={20} color={colors.subtle} />}
            />

            {formError ? (
              <View className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3">
                <Text className="text-danger text-sm">{formError}</Text>
              </View>
            ) : null}

            <Button label="Se connecter" onPress={onSubmit} loading={loading} className="mt-2" />

            <View className="flex-row justify-center mt-4">
              <Text className="text-muted">Pas encore de compte ? </Text>
              <Link href="/(auth)/register">
                <Text className="text-primary font-semibold">Créer un compte</Text>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
