import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { recommendationPosition } from '../../lib/theme';

/** Barre dégradée (À éviter → Sûr) avec un marqueur positionné selon le grade. */
export function RecommendationSlider({ grade }: { grade: string }) {
  const pos = recommendationPosition(grade);

  return (
    <View>
      <View className="relative justify-center">
        <LinearGradient
          colors={['#EF4444', '#F59E0B', '#EAB308', '#22C55E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 10, borderRadius: 6 }}
        />
        <View
          style={{ left: `${pos * 100}%`, marginLeft: -11 }}
          className="absolute w-[22px] h-[22px] rounded-full bg-white border-4 border-background"
        />
      </View>
      <View className="flex-row justify-between mt-3">
        <Text className="text-danger text-xs font-medium">À éviter</Text>
        <Text className="text-warning text-xs font-medium">Modéré</Text>
        <Text className="text-primary text-xs font-medium">Sûr</Text>
      </View>
    </View>
  );
}
