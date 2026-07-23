import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Bell,
  CalendarDays,
  ChevronRight,
  FileText,
  Globe,
  HeartPulse,
  Info,
  LogOut,
  Moon,
  Ruler,
  Settings,
  Star,
  Trash2,
  TrendingUp,
  User as UserIcon,
  UserCircle2,
  Weight,
} from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Switch, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { Input } from '../../components/ui/Input';
import { PressableScale } from '../../components/ui/PressableScale';
import { Screen } from '../../components/ui/Screen';
import { StatCard } from '../../components/ui/StatCard';
import { useAuth } from '../../lib/auth';
import { useDeleteAccount, useStats, useUpdateProfile } from '../../lib/queries';
import { CONDITION_OPTIONS, cardShadow, colors, conditionLabel, useColors } from '../../lib/theme';
import type { Profile } from '../../lib/types';

type EditField = 'full_name' | 'age' | 'sex' | 'weight_kg' | 'height_cm' | 'health_conditions';

const SEX_LABELS: Record<string, string> = { male: 'Masculin', female: 'Féminin', other: 'Autre' };

export default function ProfileScreen() {
  const router = useRouter();
  const c = useColors();
  const { session, profile, refreshProfile, signOut } = useAuth();
  const { stats } = useStats();
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();

  const [editing, setEditing] = useState<EditField | null>(null);
  const [draftText, setDraftText] = useState('');
  const [draftConditions, setDraftConditions] = useState<string[]>([]);
  const [draftSex, setDraftSex] = useState<string | null>(null);

  const firstName = (profile?.full_name ?? '').split(' ')[0] || 'là';

  async function persist(patch: Partial<Profile>) {
    if (!session?.user) return;
    await updateProfile.mutateAsync({ id: session.user.id, patch });
    await refreshProfile();
  }

  function openEdit(field: EditField) {
    if (field === 'health_conditions') {
      setDraftConditions(profile?.health_conditions ?? []);
    } else if (field === 'sex') {
      setDraftSex(profile?.sex ?? null);
    } else {
      const v = profile?.[field];
      setDraftText(v != null ? String(v) : '');
    }
    setEditing(field);
  }

  async function saveEdit() {
    if (!editing) return;
    let patch: Partial<Profile> = {};
    if (editing === 'health_conditions') patch = { health_conditions: draftConditions };
    else if (editing === 'sex') patch = { sex: draftSex };
    else if (editing === 'age') patch = { age: draftText ? Number(draftText) : null };
    else if (editing === 'weight_kg') patch = { weight_kg: draftText ? Number(draftText) : null };
    else if (editing === 'height_cm') patch = { height_cm: draftText ? Number(draftText) : null };
    else if (editing === 'full_name') patch = { full_name: draftText.trim() };
    await persist(patch);
    setEditing(null);
  }

  function confirmSignOut() {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  // Suppression de compte : irréversible → double confirmation.
  function confirmDeleteAccount() {
    if (deleteAccount.isPending) return;
    Alert.alert(
      'Supprimer le compte',
      'Cette action est définitive. Votre profil, votre historique d’analyses et vos images seront supprimés et ne pourront pas être récupérés.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Continuer', style: 'destructive', onPress: askFinalDeleteConfirm },
      ]
    );
  }

  function askFinalDeleteConfirm() {
    Alert.alert('Confirmer la suppression', 'Voulez-vous vraiment supprimer définitivement votre compte ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer définitivement', style: 'destructive', onPress: runDeleteAccount },
    ]);
  }

  async function runDeleteAccount() {
    if (!session?.user) return;
    try {
      await deleteAccount.mutateAsync(session.user.id);
      // Le compte auth est supprimé (JWT invalidé) : on nettoie la session
      // locale. L'AuthGate redirige alors automatiquement vers /login.
      await signOut();
    } catch (e) {
      Alert.alert(
        'Suppression impossible',
        e instanceof Error ? e.message : 'Une erreur est survenue. Réessayez plus tard.'
      );
    }
  }

  const conditionsText =
    profile?.health_conditions?.length
      ? profile.health_conditions.map(conditionLabel).join(', ')
      : 'Aucune';

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
        {/* En-tête */}
        <View className="flex-row items-center justify-between mb-5">
          <Text className="text-ink text-xl font-extrabold">Profil</Text>
          <View className="w-10 h-10 rounded-full bg-surface-2 items-center justify-center">
            <Settings size={20} color={c.ink} />
          </View>
        </View>

        {/* Carte profil */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={cardShadow}
          className="bg-surface/90 border border-border rounded-3xl p-5 overflow-hidden">
          {/* Accent visuel (salade) */}
          <Animated.View
            entering={ZoomIn.springify().damping(14).delay(160)}
            style={{ position: 'absolute', right: -14, top: -10, width: 128, height: 104 }}>
            <Image
              source={require('../../../assets/images/food.png')}
              style={{ width: '100%', height: '100%' }}
              contentFit="contain"
            />
          </Animated.View>

          <View className="flex-row items-center gap-4">
            <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center">
              <UserCircle2 size={40} color={colors.primary} />
            </View>
            <View className="flex-1" style={{ maxWidth: '58%' }}>
              <Text className="text-muted">Bonjour {firstName} !</Text>
              <Text className="text-ink text-xl font-extrabold" numberOfLines={1}>
                {profile?.full_name || 'Utilisateur'}
              </Text>
              <View className="self-start bg-primary/15 rounded-full px-3 py-1 mt-1">
                <Text className="text-primary text-xs font-semibold">Membre actif</Text>
              </View>
            </View>
          </View>

          <View className="flex-row gap-3 mt-5">
            <StatCard
              icon={<FileText size={16} color={colors.primary} />}
              value={stats.total}
              label="Analyses"
              tint={colors.primary}
            />
            <StatCard
              icon={<TrendingUp size={16} color={colors.info} />}
              value={stats.activeWeeks}
              label="Semaines actives"
              tint={colors.info}
            />
            <StatCard
              icon={<Star size={16} color={colors.warning} />}
              value={stats.goalsReached}
              label="Objectifs atteints"
              tint={colors.warning}
            />
          </View>
        </Animated.View>

        {/* Informations personnelles */}
        <Text className="text-ink text-lg font-bold mt-7 mb-3">Informations personnelles</Text>
        <View className="bg-surface/90 border border-border rounded-2xl overflow-hidden">
          <InfoRow
            icon={<UserIcon size={18} color={colors.primary} />}
            label="Nom"
            value={profile?.full_name || '—'}
            onPress={() => openEdit('full_name')}
          />
          <InfoRow
            icon={<CalendarDays size={18} color={colors.info} />}
            label="Âge"
            value={profile?.age ? `${profile.age} ans` : '—'}
            onPress={() => openEdit('age')}
          />
          <InfoRow
            icon={<UserIcon size={18} color={colors.purple} />}
            label="Sexe"
            value={profile?.sex ? SEX_LABELS[profile.sex] ?? profile.sex : '—'}
            onPress={() => openEdit('sex')}
          />
          <InfoRow
            icon={<HeartPulse size={18} color={colors.danger} />}
            label="Conditions de santé"
            value={conditionsText}
            onPress={() => openEdit('health_conditions')}
          />
          <InfoRow
            icon={<Weight size={18} color={colors.warning} />}
            label="Poids"
            value={profile?.weight_kg ? `${profile.weight_kg} kg` : '—'}
            onPress={() => openEdit('weight_kg')}
          />
          <InfoRow
            icon={<Ruler size={18} color={colors.primary} />}
            label="Taille"
            value={profile?.height_cm ? `${profile.height_cm} cm` : '—'}
            onPress={() => openEdit('height_cm')}
            last
          />
        </View>

        {/* Paramètres */}
        <Text className="text-ink text-lg font-bold mt-7 mb-3">Paramètres</Text>
        <View className="bg-surface/90 border border-border rounded-2xl overflow-hidden">
          <ToggleRow
            icon={<Bell size={18} color={colors.primary} />}
            label="Notifications"
            value={profile?.notifications_enabled ?? true}
            onChange={(v) => persist({ notifications_enabled: v })}
          />
          <InfoRow
            icon={<Moon size={18} color={colors.info} />}
            label="Apparence"
            value="Automatique"
            onPress={() =>
              Alert.alert(
                'Apparence',
                'Le thème clair ou sombre suit automatiquement le réglage de votre téléphone (Réglages → Luminosité et affichage).'
              )
            }
          />
          <InfoRow
            icon={<Globe size={18} color={colors.purple} />}
            label="Langue"
            value="Français"
            onPress={() => {}}
          />
          <InfoRow
            icon={<Info size={18} color={c.muted} />}
            label="À propos de l'application"
            value=""
            onPress={() =>
              Alert.alert('NutriScan', 'Version 1.0.0\nAnalysez vos aliments et mangez mieux.')
            }
          />
          <PressableScale onPress={confirmSignOut} scaleTo={0.98} haptic>
            <View className="flex-row items-center gap-3 px-4 py-4 border-b border-border/60">
              <View className="w-9 h-9 rounded-xl bg-danger/15 items-center justify-center">
                <LogOut size={18} color={colors.danger} />
              </View>
              <Text className="text-danger font-semibold flex-1">Déconnexion</Text>
              <ChevronRight size={18} color={colors.subtle} />
            </View>
          </PressableScale>

          <PressableScale
            onPress={confirmDeleteAccount}
            scaleTo={0.98}
            haptic
            disabled={deleteAccount.isPending}>
            <View className="flex-row items-center gap-3 px-4 py-4">
              <View className="w-9 h-9 rounded-xl bg-danger/15 items-center justify-center">
                <Trash2 size={18} color={colors.danger} />
              </View>
              <Text className="text-danger font-semibold flex-1">Supprimer mon compte</Text>
              {deleteAccount.isPending ? (
                <ActivityIndicator size="small" color={colors.danger} />
              ) : (
                <ChevronRight size={18} color={colors.subtle} />
              )}
            </View>
          </PressableScale>
        </View>

        <Text className="text-subtle text-xs text-center mt-3 px-6">
          La suppression du compte efface définitivement votre profil, votre historique et vos images.
        </Text>
      </ScrollView>

      {/* Modal d'édition */}
      <Modal visible={editing !== null} transparent animationType="slide" onRequestClose={() => setEditing(null)}>
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-surface border-t border-border rounded-t-3xl p-6" style={{ paddingBottom: 36 }}>
            <View className="w-10 h-1 rounded-full bg-border-soft self-center mb-5" />
            <Text className="text-ink text-lg font-bold mb-4">{editLabel(editing)}</Text>

            {editing === 'health_conditions' ? (
              <View className="flex-row flex-wrap gap-2 mb-2">
                {CONDITION_OPTIONS.map((o) => (
                  <Chip
                    key={o.key}
                    label={o.label}
                    active={draftConditions.includes(o.key)}
                    onPress={() =>
                      setDraftConditions((prev) =>
                        prev.includes(o.key) ? prev.filter((c) => c !== o.key) : [...prev, o.key]
                      )
                    }
                  />
                ))}
              </View>
            ) : editing === 'sex' ? (
              <View className="flex-row gap-2 mb-2">
                {Object.entries(SEX_LABELS).map(([key, label]) => (
                  <Chip key={key} label={label} active={draftSex === key} onPress={() => setDraftSex(key)} />
                ))}
              </View>
            ) : (
              <Input
                value={draftText}
                onChangeText={setDraftText}
                autoFocus
                keyboardType={editing === 'full_name' ? 'default' : 'number-pad'}
                placeholder="Saisir une valeur"
              />
            )}

            <View className="gap-2 mt-5">
              <Button label="Enregistrer" onPress={saveEdit} loading={updateProfile.isPending} />
              <Button label="Annuler" variant="ghost" onPress={() => setEditing(null)} />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function editLabel(field: EditField | null): string {
  const map: Record<EditField, string> = {
    full_name: 'Nom complet',
    age: 'Âge',
    sex: 'Sexe',
    weight_kg: 'Poids (kg)',
    height_cm: 'Taille (cm)',
    health_conditions: 'Conditions de santé',
  };
  return field ? map[field] : '';
}

function InfoRow({
  icon,
  label,
  value,
  onPress,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <PressableScale onPress={onPress} scaleTo={0.99} haptic={false}>
      <View
        className={`flex-row items-center gap-3 px-4 py-4 ${last ? '' : 'border-b border-border/60'}`}>
        <View className="w-9 h-9 rounded-xl bg-surface-2 items-center justify-center">{icon}</View>
        <Text className="text-muted flex-1">{label}</Text>
        <Text className="text-ink font-medium max-w-[52%] text-right" numberOfLines={1}>
          {value}
        </Text>
        <ChevronRight size={18} color={colors.subtle} />
      </View>
    </PressableScale>
  );
}

function ToggleRow({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const c = useColors();
  return (
    <View className="flex-row items-center gap-3 px-4 py-3.5 border-b border-border/60">
      <View className="w-9 h-9 rounded-xl bg-surface-2 items-center justify-center">{icon}</View>
      <Text className="text-ink flex-1">{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: c.surface3, true: c.primaryDark }}
        thumbColor={value ? c.primary : c.subtle}
        ios_backgroundColor={c.surface3}
      />
    </View>
  );
}
