import { useRouter } from 'expo-router';
import { Leaf, ScanLine } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SwipeableAnalysisItem } from '../../components/SwipeableAnalysisItem';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { Screen } from '../../components/ui/Screen';
import { AnalysisItemSkeleton } from '../../components/ui/Skeleton';
import { useAnalyses } from '../../lib/queries';
import { colors } from '../../lib/theme';

const FILTERS = [
  { key: 'all', label: 'Toutes' },
  { key: 'Aliment', label: 'Aliments' },
  { key: 'Boisson', label: 'Boissons' },
];

export default function History() {
  const router = useRouter();
  const { data: analyses = [], isLoading, isRefetching, refetch } = useAnalyses();
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(
    () => (filter === 'all' ? analyses : analyses.filter((a) => a.food_type === filter)),
    [analyses, filter]
  );

  return (
    <Screen>
      {/* En-tête */}
      <View className="flex-row items-center gap-2 px-5 pt-1 pb-3">
        <View className="w-9 h-9 rounded-xl bg-primary items-center justify-center">
          <Leaf size={20} color="#052e16" />
        </View>
        <Text className="text-ink text-xl font-extrabold">Historique</Text>
      </View>

      {/* Filtres */}
      <View className="flex-row gap-2 px-5 pb-3">
        {FILTERS.map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            active={filter === f.key}
            onPress={() => setFilter(f.key)}
          />
        ))}
      </View>

      {isLoading ? (
        <View style={{ padding: 20, gap: 12 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <AnalysisItemSkeleton key={i} />
          ))}
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <View className="w-16 h-16 rounded-full bg-primary/15 items-center justify-center mb-4">
            <ScanLine size={30} color={colors.primary} />
          </View>
          <Text className="text-ink text-lg font-bold">Aucune analyse</Text>
          <Text className="text-muted text-center mt-1 mb-6">
            Scannez l'étiquette d'un aliment pour commencer votre historique.
          </Text>
          <Button
            label="Analyser un aliment"
            fullWidth={false}
            onPress={() => router.push('/(tabs)/analyze')}
          />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.duration(300).delay(Math.min(index * 40, 300))}>
              <SwipeableAnalysisItem analysis={item} />
            </Animated.View>
          )}
        />
      )}
    </Screen>
  );
}
