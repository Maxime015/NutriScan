import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertCircle, Camera, CheckCircle2, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { Button } from '../../components/ui/Button';
import { ScoreGauge } from '../../components/ui/ScoreGauge';
import { analyzeImage, ApiError } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { useSaveAnalysis } from '../../lib/queries';
import { colors, impactMeta, useColors } from '../../lib/theme';
import type { AnalysisRow, AnalyzeResponse } from '../../lib/types';

type Phase = 'loading' | 'done' | 'error';

function countIngredients(text: string): number {
  if (!text) return 0;
  const cleaned = text.replace(/\n/g, ',');
  const parts = cleaned
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 1);
  return Math.min(parts.length, 99);
}

export default function Processing() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const router = useRouter();
  const { session, profile } = useAuth();
  const saveAnalysis = useSaveAnalysis();
  const tc = useColors();

  const [phase, setPhase] = useState<Phase>('loading');
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [saved, setSaved] = useState<AnalysisRow | null>(null);
  const [error, setError] = useState<string>('');
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !uri) return;
    started.current = true;

    (async () => {
      try {
        const res = await analyzeImage({
          uri,
          healthConditions: profile?.health_conditions ?? [],
          accessToken: session?.access_token ?? null,
        });
        setResult(res);

        if (session?.user) {
          const row = await saveAnalysis.mutateAsync({
            userId: session.user.id,
            uri,
            result: res,
          });
          setSaved(row);
        }
        setPhase('done');
      } catch (e) {
        setError(
          e instanceof ApiError ? e.message : "Une erreur est survenue pendant l'analyse."
        );
        setPhase('error');
      }
    })();
  }, [uri, session, profile, saveAnalysis]);

  // ---- Chargement ----
  if (phase === 'loading') {
    return (
      <View className="flex-1 bg-background items-center justify-center px-8">
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width: 160, height: 200, borderRadius: 20, opacity: 0.5 }}
            contentFit="cover"
          />
        ) : null}
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 28 }} />
        <Text className="text-ink text-lg font-bold mt-5">Analyse en cours…</Text>
        <Text className="text-muted text-center mt-1">
          Lecture de l'étiquette et évaluation de la santé
        </Text>
      </View>
    );
  }

  // ---- Erreur ----
  if (phase === 'error') {
    return (
      <View className="flex-1 bg-background items-center justify-center px-8">
        <View className="w-16 h-16 rounded-full bg-danger/15 items-center justify-center mb-5">
          <AlertCircle size={32} color={colors.danger} />
        </View>
        <Text className="text-ink text-xl font-bold text-center mb-2">Analyse impossible</Text>
        <Text className="text-muted text-center mb-8">{error}</Text>
        <View className="w-full gap-3">
          <Button label="Réessayer" onPress={() => router.replace('/analysis/camera')} />
          <Button label="Retour à l'accueil" variant="ghost" onPress={() => router.replace('/(tabs)')} />
        </View>
      </View>
    );
  }

  // ---- Succès ----
  const grade = result?.analysis.grade ?? '?';
  const impact = impactMeta(result?.analysis.impact ?? result?.usage?.impact);
  const risksCount = result?.risks.list.length ?? 0;
  const allergensCount = result?.allergens.list.length ?? 0;
  const ingredientsCount = countIngredients(result?.extracted_text ?? '');

  return (
    <View className="flex-1 bg-background/95 justify-center px-6">
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="bg-surface border border-border rounded-3xl p-6">
        <View className="items-end">
          <Pressable onPress={() => router.replace('/(tabs)')} hitSlop={10}>
            <X size={24} color={colors.subtle} />
          </Pressable>
        </View>

        <Animated.View entering={ZoomIn.duration(400).delay(100)} className="items-center">
          <View className="w-16 h-16 rounded-full bg-primary items-center justify-center mb-3">
            <CheckCircle2 size={34} color="#052e16" />
          </View>
          <Text className="text-ink text-2xl font-extrabold">Analyse terminée !</Text>
          <Text className="text-muted text-center mt-1 mb-5">
            Voici les résultats de l'analyse de votre liste d'ingrédients
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeIn.duration(500).delay(250)}
          className="bg-surface-2/60 rounded-2xl p-5 items-center">
          <Text className="text-muted text-sm mb-3">Score de santé</Text>
          <ScoreGauge grade={grade} confidence={result?.analysis.confidence ?? 0} size={150} />
          <View
            className="flex-row items-center gap-2 mt-3 px-4 py-2 rounded-full"
            style={{ backgroundColor: `${impact.color}1f` }}>
            <Text style={{ color: impact.color }} className="font-semibold">
              Impact {impact.label.toLowerCase()}
            </Text>
          </View>
        </Animated.View>

        <View className="flex-row gap-3 mt-5">
          <MiniStat value={risksCount} label="Risques détectés" color={colors.warning} />
          <MiniStat value={allergensCount} label="Allergènes" color={colors.pink} />
          <MiniStat value={ingredientsCount} label="Ingrédients" color={colors.info} />
        </View>

        <View className="gap-3 mt-6">
          <Button
            label="Voir les résultats détaillés"
            onPress={() =>
              saved
                ? router.replace(`/analysis/${saved.id}`)
                : router.replace('/(tabs)/history')
            }
          />
          <Button
            label="Analyser un autre aliment"
            variant="secondary"
            icon={<Camera size={18} color={tc.ink} />}
            onPress={() => router.replace('/analysis/camera')}
          />
        </View>
      </Animated.View>
    </View>
  );
}

function MiniStat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View className="flex-1 bg-surface-2/60 rounded-2xl p-3 items-center">
      <Text className="text-xs text-muted text-center mb-1">{label}</Text>
      <Text style={{ color }} className="text-2xl font-extrabold">
        {value}
      </Text>
    </View>
  );
}
