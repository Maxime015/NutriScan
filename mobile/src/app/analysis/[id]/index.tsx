import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Activity,
  AlertTriangle,
  ChevronRight,
  Clock,
  FileText,
  Gauge,
  HeartPulse,
  Share2,
  Sparkles,
  TrendingUp,
  Utensils,
} from 'lucide-react-native';
import { ActivityIndicator, Share, Text, View } from 'react-native';
import { ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { RecommendationSlider } from '../../../components/analysis/RecommendationSlider';
import { Header } from '../../../components/ui/Header';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScoreGauge } from '../../../components/ui/ScoreGauge';
import { Screen } from '../../../components/ui/Screen';
import { frequencyLabel, quantityLabel } from '../../../lib/labels';
import { useAnalysis } from '../../../lib/queries';
import { colors, impactMeta, levelLabel, useColors } from '../../../lib/theme';

export default function ResultDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const c = useColors();
  const { data: analysis, isLoading } = useAnalysis(id);

  if (isLoading || !analysis) {
    return (
      <Screen>
        <Header title="Résultats d'analyse" />
        <View className="flex-1 items-center justify-center">
          {isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text className="text-muted">Analyse introuvable.</Text>
          )}
        </View>
      </Screen>
    );
  }

  const impact = impactMeta(analysis.impact ?? analysis.usage?.impact);
  const { product_name, grade } = analysis;

  async function share() {
    await Share.share({
      message: `NutriScan — ${product_name}\nScore de santé : ${grade} • Impact ${impact.label}`,
    });
  }

  return (
    <Screen>
      <Header
        title="Résultats d'analyse"
        right={
          <PressableScale onPress={share} scaleTo={0.9}>
            <Share2 size={20} color={c.ink} />
          </PressableScale>
        }
      />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        {/* Carte score */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="bg-surface/90 border border-border rounded-3xl p-6 items-center">
          <View className="flex-row items-center gap-2 mb-4">
            <Activity size={18} color={colors.primary} />
            <Text className="text-ink font-semibold">Score de santé</Text>
          </View>
          <ScoreGauge grade={analysis.grade} confidence={analysis.confidence} size={190} />
          <View
            className="flex-row items-center gap-2 mt-4 px-4 py-2 rounded-full"
            style={{ backgroundColor: `${impact.color}1f` }}>
            <Gauge size={16} color={impact.color} />
            <Text style={{ color: impact.color }} className="font-semibold">
              Impact {impact.label.toLowerCase()}
            </Text>
          </View>
        </Animated.View>

        {/* Guide de consommation */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} className="mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Utensils size={18} color={colors.primary} />
            <Text className="text-ink text-lg font-bold">Guide de consommation</Text>
          </View>
          <View className="flex-row flex-wrap gap-3">
            <GuideTile
              icon={<TrendingUp size={16} color={colors.info} />}
              label="NIVEAU"
              value={levelLabel(analysis.usage?.level)}
            />
            <GuideTile
              icon={<Clock size={16} color={colors.info} />}
              label="FRÉQUENCE"
              value={frequencyLabel(analysis.usage?.frequency)}
            />
            <GuideTile
              icon={<Activity size={16} color={colors.info} />}
              label="QUANTITÉ"
              value={quantityLabel(analysis.usage?.quantity)}
            />
            <GuideTile
              icon={<Gauge size={16} color={colors.info} />}
              label="IMPACT"
              value={impact.label}
            />
          </View>
        </Animated.View>

        {/* Niveau de recommandation */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(180)}
          className="bg-surface/90 border border-border rounded-2xl p-5 mt-6">
          <Text className="text-ink font-semibold mb-4">Niveau de recommandation</Text>
          <RecommendationSlider grade={analysis.grade} />
        </Animated.View>

        {/* Liens vers les détails */}
        <Animated.View entering={FadeInDown.duration(400).delay(260)} className="mt-6 gap-3">
          <DetailLink
            icon={<AlertTriangle size={20} color={colors.warning} />}
            title="Facteurs de risque"
            count={analysis.risks.list.length}
            tint={colors.warning}
            onPress={() => router.push(`/analysis/${id}/risks`)}
          />
          <DetailLink
            icon={<HeartPulse size={20} color={colors.purple} />}
            title="Allergènes détectés"
            count={analysis.allergens.list.length}
            tint={colors.purple}
            onPress={() => router.push(`/analysis/${id}/allergens`)}
          />
          <DetailLink
            icon={<FileText size={20} color={colors.info} />}
            title="Texte extrait"
            tint={colors.info}
            onPress={() => router.push(`/analysis/${id}/extracted`)}
          />
        </Animated.View>

        {/* Explication IA */}
        {analysis.ai_explanation && analysis.ai_explanation !== 'Basic analysis provided.' ? (
          <Animated.View
            entering={FadeInDown.duration(400).delay(340)}
            className="bg-primary/5 border border-primary/25 rounded-2xl p-5 mt-6">
            <View className="flex-row items-center gap-2 mb-2">
              <Sparkles size={18} color={colors.primary} />
              <Text className="text-primary font-bold">Analyse personnalisée</Text>
            </View>
            <Text className="text-muted leading-6">{analysis.ai_explanation}</Text>
          </Animated.View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function GuideTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View
      className="bg-surface/90 border border-border rounded-2xl p-4"
      style={{ width: '47.5%' }}>
      <View className="flex-row items-center gap-2 mb-2">
        {icon}
        <Text className="text-subtle text-[11px] font-semibold tracking-wide">{label}</Text>
      </View>
      <Text className="text-ink font-bold text-base" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function DetailLink({
  icon,
  title,
  count,
  tint,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
  tint: string;
  onPress: () => void;
}) {
  return (
    <PressableScale onPress={onPress} scaleTo={0.98}>
      <View className="bg-surface/90 border border-border rounded-2xl p-4 flex-row items-center gap-3">
        <View
          className="w-11 h-11 rounded-xl items-center justify-center"
          style={{ backgroundColor: `${tint}1f` }}>
          {icon}
        </View>
        <Text className="text-ink font-semibold flex-1">{title}</Text>
        {typeof count === 'number' ? (
          <View
            className="min-w-[26px] h-6 px-2 rounded-full items-center justify-center"
            style={{ backgroundColor: `${tint}22` }}>
            <Text style={{ color: tint }} className="font-bold text-xs">
              {count}
            </Text>
          </View>
        ) : null}
        <ChevronRight size={20} color={colors.subtle} />
      </View>
    </PressableScale>
  );
}
