import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarDays, Hash, RotateCw } from 'lucide-react-native';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button } from '../../../components/ui/Button';
import { Header } from '../../../components/ui/Header';
import { Screen } from '../../../components/ui/Screen';
import { formatDate, formatDateTime } from '../../../lib/format';
import { useAnalysis } from '../../../lib/queries';
import { colors } from '../../../lib/theme';

export default function Extracted() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: analysis, isLoading } = useAnalysis(id);

  if (isLoading || !analysis) {
    return (
      <Screen>
        <Header title="Texte extrait" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  const time = formatDateTime(analysis.created_at).split('•')[1]?.trim() ?? '';
  const analysisId = `#NS-${analysis.id.slice(0, 8).toUpperCase()}`;

  return (
    <Screen>
      <Header title="Texte extrait" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="bg-surface-2/70 border border-border rounded-2xl p-5">
          <Text
            className="text-muted leading-6"
            style={{ fontFamily: 'Courier', fontSize: 13 }}
            selectable>
            {analysis.extracted_text?.trim() || 'Aucun texte extrait.'}
          </Text>
        </Animated.View>

        <View className="flex-row gap-3 mt-4">
          <View className="flex-1 bg-surface/90 border border-border rounded-2xl p-4">
            <View className="flex-row items-center gap-2 mb-2">
              <CalendarDays size={16} color={colors.primary} />
              <Text className="text-subtle text-xs font-semibold">DATE D'ANALYSE</Text>
            </View>
            <Text className="text-ink font-bold">{formatDate(analysis.created_at)}</Text>
            <Text className="text-muted text-xs mt-0.5">{time}</Text>
          </View>
          <View className="flex-1 bg-surface/90 border border-border rounded-2xl p-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Hash size={16} color={colors.info} />
              <Text className="text-subtle text-xs font-semibold">ID ANALYSE</Text>
            </View>
            <Text className="text-ink font-bold" numberOfLines={1}>
              {analysisId}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 48 }}>
          <Button
            label="Analyser à nouveau"
            icon={<RotateCw size={18} color="#ffffff" />}
            onPress={() => router.replace('/analysis/camera')}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
