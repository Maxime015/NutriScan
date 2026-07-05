import { Link } from 'expo-router';
import { Leaf, Lock, Mail, User } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { z } from 'zod';

import { AuthOrbs } from '../../components/ui/AuthOrbs';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Screen } from '../../components/ui/Screen';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { colors } from '../../lib/theme';

const schema = z
  .object({
    fullName: z.string().min(2, 'Indiquez votre nom'),
    email: z.string().email('Adresse e-mail invalide'),
    password: z.string().min(6, 'Au moins 6 caractères'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm'],
  });

export default function Register() {
  const { signUp } = useAuth();
  const [values, setValues] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof values) => (v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  async function onSubmit() {
    setFormError(null);
    setNotice(null);
    const parsed = schema.safeParse(values);
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
      await signUp(values.email, values.password, values.fullName);
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        // Confirmation e-mail activée dans Supabase.
        setNotice(
          'Compte créé ! Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous.'
        );
      }
      // Sinon l'AuthGate redirige automatiquement vers l'onboarding.
    } catch (e: any) {
      setFormError(
        e?.message?.includes('already registered')
          ? 'Un compte existe déjà avec cet e-mail.'
          : (e?.message ?? 'Inscription impossible.')
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
          <Animated.View entering={FadeInDown.duration(500)} className="items-center mb-4">
            <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-4">
              <Leaf size={32} color="#052e16" />
            </View>
            <Text className="text-ink text-3xl font-extrabold">Créer un compte</Text>
            <Text className="text-muted text-base mt-1">Commencez à manger plus sainement</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(500).delay(150)} className="gap-4">
            <Input
              label="Nom complet"
              placeholder="Jean Dupont"
              value={values.fullName}
              onChangeText={set('fullName')}
              error={errors.fullName}
              icon={<User size={20} color={colors.subtle} />}
            />
            <Input
              label="E-mail"
              placeholder="vous@exemple.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={values.email}
              onChangeText={set('email')}
              error={errors.email}
              icon={<Mail size={20} color={colors.subtle} />}
            />
            <Input
              label="Mot de passe"
              placeholder="••••••••"
              secure
              value={values.password}
              onChangeText={set('password')}
              error={errors.password}
              icon={<Lock size={20} color={colors.subtle} />}
            />
            <Input
              label="Confirmer le mot de passe"
              placeholder="••••••••"
              secure
              value={values.confirm}
              onChangeText={set('confirm')}
              error={errors.confirm}
              icon={<Lock size={20} color={colors.subtle} />}
            />

            {formError ? (
              <View className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3">
                <Text className="text-danger text-sm">{formError}</Text>
              </View>
            ) : null}
            {notice ? (
              <View className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-3">
                <Text className="text-primary text-sm">{notice}</Text>
              </View>
            ) : null}

            <Button label="S'inscrire" onPress={onSubmit} loading={loading} className="mt-2" />

            <View className="flex-row justify-center mt-4">
              <Text className="text-muted">Déjà un compte ? </Text>
              <Link href="/(auth)/login">
                <Text className="text-primary font-semibold">Se connecter</Text>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
