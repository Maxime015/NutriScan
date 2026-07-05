import { Text, View } from 'react-native';

import { useColors } from '../../lib/theme';
import { PressableScale } from './PressableScale';

interface Props {
  label: string;
  active?: boolean;
  color?: string;
  onPress?: () => void;
}

/** Puce/filtre (Toutes/Aliments/Boissons, sélection de conditions, etc.). */
export function Chip({ label, active = false, color = '#22C55E', onPress }: Props) {
  const c = useColors();
  const body = (
    <View
      className="px-4 py-2 rounded-full border"
      style={{
        backgroundColor: active ? color : 'transparent',
        borderColor: active ? color : c.border,
      }}>
      <Text
        className="text-sm font-semibold"
        style={{ color: active ? '#052e16' : c.muted }}>
        {label}
      </Text>
    </View>
  );
  return onPress ? (
    <PressableScale onPress={onPress} scaleTo={0.95} haptic>
      {body}
    </PressableScale>
  ) : (
    body
  );
}
