import { HeartPulse, Ruler, User, Weight } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { Input } from '../../components/ui/Input';
import { Screen } from '../../components/ui/Screen';
import { useAuth } from '../../lib/auth';
import { useUpdateProfile } from '../../lib/queries';
import { CONDITION_OPTIONS, colors } from '../../lib/theme';

const SEX_OPTIONS = [
  { key: 'male', label: 'Masculin' },
  { key: 'female', label: 'Féminin' },
  { key: 'other', label: 'Autre' },
];

export default function Onboarding() {
  const { session, profile, refreshProfile, signOut } = useAuth();
  const updateProfile = useUpdateProfile();

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function toggleCondition(key: string) {
    setConditions((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  }

  async function onSubmit() {
    if (!session?.user) return;
    if (fullName.trim().length < 2) {
      setError('Veuillez indiquer votre nom.');
      return;
    }
    setError(null);
    try {
      await updateProfile.mutateAsync({
        id: session.user.id,
        patch: {
          full_name: fullName.trim(),
          age: age ? Number(age) : null,
          sex,
          weight_kg: weight ? Number(weight) : null,
          height_cm: height ? Number(height) : null,
          health_conditions: conditions,
          onboarded: true,
        },
      });
      await refreshProfile();
      // L'AuthGate bascule ensuite vers /(tabs).
    } catch (e: any) {
      setError(e?.message ?? "Impossible d'enregistrer le profil.");
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(500)}>
            <Text className="text-ink text-3xl font-extrabold">Votre profil</Text>
            <Text className="text-muted text-base mt-2 mb-6">
              Ces informations personnalisent l'analyse de vos aliments selon votre santé.
            </Text>
          </Animated.View>

          <View className="gap-4">
            <Input
              label="Nom complet"
              placeholder="Jean Dupont"
              value={fullName}
              onChangeText={setFullName}
              icon={<User size={20} color={colors.subtle} />}
            />

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Input
                  label="Âge"
                  placeholder="32"
                  keyboardType="number-pad"
                  value={age}
                  onChangeText={setAge}
                />
              </View>
              <View className="flex-1">
                <Input
                  label="Poids (kg)"
                  placeholder="72"
                  keyboardType="number-pad"
                  value={weight}
                  onChangeText={setWeight}
                  icon={<Weight size={18} color={colors.subtle} />}
                />
              </View>
            </View>

            <Input
              label="Taille (cm)"
              placeholder="175"
              keyboardType="number-pad"
              value={height}
              onChangeText={setHeight}
              icon={<Ruler size={18} color={colors.subtle} />}
            />

            <View>
              <Text className="text-muted text-sm mb-2 ml-1 font-medium">Sexe</Text>
              <View className="flex-row gap-2">
                {SEX_OPTIONS.map((o) => (
                  <Chip
                    key={o.key}
                    label={o.label}
                    active={sex === o.key}
                    onPress={() => setSex(o.key)}
                  />
                ))}
              </View>
            </View>

            <View className="mt-2">
              <View className="flex-row items-center gap-2 mb-3">
                <HeartPulse size={18} color={colors.primary} />
                <Text className="text-ink font-semibold">Conditions de santé</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {CONDITION_OPTIONS.map((o) => (
                  <Chip
                    key={o.key}
                    label={o.label}
                    active={conditions.includes(o.key)}
                    onPress={() => toggleCondition(o.key)}
                  />
                ))}
              </View>
              <Text className="text-subtle text-xs mt-2 ml-1">
                Optionnel — utilisé pour adapter les recommandations.
              </Text>
            </View>

            {error ? (
              <View className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3">
                <Text className="text-danger text-sm">{error}</Text>
              </View>
            ) : null}

            <Button
              label="Terminer"
              onPress={onSubmit}
              loading={updateProfile.isPending}
              className="mt-4"
            />
            <Button label="Se déconnecter" variant="ghost" onPress={() => signOut()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
