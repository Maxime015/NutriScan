import { useLocalSearchParams } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { RiskCard } from '../../../components/analysis/RiskCard';
import { Header } from '../../../components/ui/Header';
import { Screen } from '../../../components/ui/Screen';
import { useAnalysis } from '../../../lib/queries';
import { colors } from '../../../lib/theme';

export default function Risks() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: analysis, isLoading } = useAnalysis(id);

  const details = analysis?.risks.details ?? [];

  return (
    <Screen>
      <Header title="Facteurs de risque" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="items-center mt-20">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : details.length === 0 ? (
          <View className="items-center mt-16 px-6">
            <View className="w-16 h-16 rounded-full bg-primary/15 items-center justify-center mb-4">
              <ShieldCheck size={32} color={colors.primary} />
            </View>
            <Text className="text-ink text-lg font-bold">Aucun risque majeur</Text>
            <Text className="text-muted text-center mt-1">
              Aucun facteur de risque notable n'a été détecté dans cet aliment.
            </Text>
          </View>
        ) : (
          <View className="gap-4">
            {details.map((risk, i) => (
              <Animated.View key={risk.name} entering={FadeInDown.duration(350).delay(i * 60)}>
                <RiskCard risk={risk} />
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
