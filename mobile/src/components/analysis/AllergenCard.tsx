import { HeartPulse } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { allergenLabel } from '../../lib/labels';
import type { AllergenDetail } from '../../lib/types';

/** Carte "Allergène détecté" (icône violette, nom, symptômes). */
export function AllergenCard({ allergen }: { allergen: AllergenDetail }) {
  return (
    <View className="bg-purple/5 border border-purple/25 rounded-2xl p-4">
      <View className="flex-row items-start gap-3">
        <View className="w-10 h-10 rounded-xl bg-purple/15 items-center justify-center">
          <HeartPulse size={20} color="#8B5CF6" />
        </View>
        <View className="flex-1">
          <Text className="text-purple text-base font-bold mb-1">
            {allergenLabel(allergen.name)}
          </Text>
          <Text className="text-muted text-sm leading-5">
            Symptômes : problèmes digestifs / réactions allergiques
          </Text>
        </View>
      </View>
    </View>
  );
}
