import { useLocalSearchParams } from 'expo-router';
import {
  CheckCircle2,
  Info,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react-native';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AllergenCard } from '../../../components/analysis/AllergenCard';
import { Header } from '../../../components/ui/Header';
import { Screen } from '../../../components/ui/Screen';
import { useAnalysis } from '../../../lib/queries';
import { colors } from '../../../lib/theme';

export default function Allergens() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: analysis, isLoading } = useAnalysis(id);

  if (isLoading || !analysis) {
    return (
      <Screen>
        <Header title="Allergènes détectés" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  const allergens = analysis.allergens.details ?? [];
  const rec = analysis.recommendations ?? { overall: '', do: [], avoid: [], alternatives: [], medical_warnings: [] };

  return (
    <Screen>
      <Header title="Allergènes détectés" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        {allergens.length === 0 ? (
          <View className="items-center py-8 px-6">
            <View className="w-16 h-16 rounded-full bg-primary/15 items-center justify-center mb-4">
              <ShieldCheck size={32} color={colors.primary} />
            </View>
            <Text className="text-ink text-lg font-bold">Aucun allergène courant</Text>
            <Text className="text-muted text-center mt-1">
              Aucun allergène majeur n'a été détecté dans la liste d'ingrédients.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {allergens.map((a, i) => (
              <Animated.View key={a.name} entering={FadeInDown.duration(350).delay(i * 60)}>
                <AllergenCard allergen={a} />
              </Animated.View>
            ))}
          </View>
        )}

        <View className="bg-purple/5 border border-purple/25 rounded-2xl p-4 mt-4 flex-row gap-3">
          <Info size={20} color={colors.purple} />
          <Text className="text-muted flex-1 leading-5">
            Si vous avez des allergies sévères, consultez toujours un professionnel de santé.
          </Text>
        </View>

        {/* Recommandations */}
        <View className="flex-row items-center gap-2 mt-8 mb-3">
          <Lightbulb size={20} color={colors.primary} />
          <Text className="text-ink text-lg font-bold">Recommandations</Text>
        </View>

        {rec.overall ? (
          <View className="bg-purple/10 border border-purple/25 rounded-2xl px-4 py-3 mb-3 flex-row items-center gap-2">
            <Sparkles size={16} color={colors.purple} />
            <Text className="text-ink flex-1">{rec.overall}</Text>
          </View>
        ) : null}

        {rec.do?.length ? (
          <RecoGroup
            title="À privilégier"
            color={colors.primary}
            items={rec.do}
            icon={<CheckCircle2 size={16} color={colors.primary} />}
          />
        ) : null}

        {rec.avoid?.length ? (
          <RecoGroup
            title="À éviter"
            color={colors.danger}
            items={rec.avoid}
            icon={<XCircle size={16} color={colors.danger} />}
          />
        ) : null}

        {rec.alternatives?.length ? (
          <RecoGroup
            title="Alternatives"
            color={colors.info}
            items={rec.alternatives}
            icon={<Sparkles size={16} color={colors.info} />}
          />
        ) : null}

        {rec.medical_warnings?.length ? (
          <View className="bg-warning/5 border border-warning/25 rounded-2xl p-4 mt-3">
            <Text className="text-warning font-bold mb-2">Avertissements médicaux</Text>
            {rec.medical_warnings.map((w) => (
              <Text key={w} className="text-muted leading-5 mb-1">
                • {w}
              </Text>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function RecoGroup({
  title,
  color,
  items,
  icon,
}: {
  title: string;
  color: string;
  items: string[];
  icon: React.ReactNode;
}) {
  return (
    <View
      className="rounded-2xl p-4 mb-3 border"
      style={{ backgroundColor: `${color}0d`, borderColor: `${color}33` }}>
      <Text style={{ color }} className="font-bold mb-2">
        {title}
      </Text>
      {items.map((item) => (
        <View key={item} className="flex-row items-center gap-2 mb-1.5">
          {icon}
          <Text className="text-muted flex-1">{item}</Text>
        </View>
      ))}
    </View>
  );
}
