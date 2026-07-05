import { AlertTriangle } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { riskDescriptionFr, riskLabel } from '../../lib/labels';
import type { RiskDetail } from '../../lib/types';

/** Carte "Facteur de risque" (icône orange, nom, description, note long terme). */
export function RiskCard({ risk }: { risk: RiskDetail }) {
  return (
    <View className="bg-warning/5 border border-warning/25 rounded-2xl p-4">
      <View className="flex-row items-start gap-3">
        <View className="w-10 h-10 rounded-xl bg-warning/15 items-center justify-center">
          <AlertTriangle size={20} color="#F59E0B" />
        </View>
        <View className="flex-1">
          <Text className="text-warning text-base font-bold mb-1">{riskLabel(risk.name)}</Text>
          <Text className="text-muted text-sm leading-5">
            {riskDescriptionFr(risk.name, risk.description)}
          </Text>
          <View className="bg-warning/10 rounded-lg px-3 py-2 mt-3">
            <Text className="text-warning/90 text-xs">À long terme : peut être nocif</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
