import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronRight, FileText } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { formatDateTime } from '../lib/format';
import { cardShadow, colors, impactMeta } from '../lib/theme';
import type { AnalysisRow } from '../lib/types';
import { GradeBadge } from './ui/GradeBadge';
import { PressableScale } from './ui/PressableScale';

export function AnalysisListItem({
  analysis,
  onPress,
}: {
  analysis: AnalysisRow;
  /** Surcharge la navigation par défaut (utile pour le swipe-to-delete). */
  onPress?: () => void;
}) {
  const router = useRouter();
  const impact = impactMeta(analysis.impact ?? analysis.usage?.impact);
  const handlePress = onPress ?? (() => router.push(`/analysis/${analysis.id}`));

  return (
    <PressableScale onPress={handlePress} scaleTo={0.98}>
      <View
        style={cardShadow}
        className="bg-surface/90 border border-border rounded-2xl p-3 flex-row items-center gap-3">
        <View className="w-14 h-14 rounded-xl bg-surface-2 items-center justify-center overflow-hidden">
          {analysis.image_url ? (
            <Image source={{ uri: analysis.image_url }} style={{ width: 56, height: 56 }} contentFit="cover" />
          ) : (
            <FileText size={22} color={colors.subtle} />
          )}
        </View>

        <View className="flex-1">
          <Text className="text-ink font-bold" numberOfLines={1}>
            {analysis.product_name}
          </Text>
          <Text className="text-subtle text-xs mt-0.5">{formatDateTime(analysis.created_at)}</Text>
          <View className="flex-row items-center gap-3 mt-1.5">
            <Text className="text-muted text-xs">
              Score <Text style={{ color: impact.color }} className="font-semibold">{analysis.grade}</Text>
            </Text>
            <Text className="text-muted text-xs">
              Impact <Text style={{ color: impact.color }} className="font-semibold">{impact.label}</Text>
            </Text>
          </View>
        </View>

        <GradeBadge grade={analysis.grade} size={40} />
        <ChevronRight size={18} color={colors.subtle} />
      </View>
    </PressableScale>
  );
}
