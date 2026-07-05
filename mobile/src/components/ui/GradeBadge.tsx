import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { gradeColor } from '../../lib/theme';

interface Props {
  grade: string;
  size?: number;
}

/** Petit badge circulaire (anneau + lettre) utilisé dans l'historique/aperçus. */
export function GradeBadge({ grade, size = 44 }: Props) {
  const color = gradeColor(grade);
  const stroke = size * 0.09;
  const r = (size - stroke) / 2;
  const c = size / 2;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={r} stroke={`${color}33`} strokeWidth={stroke} fill="none" />
        <Circle
          cx={c}
          cy={c}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * r * 0.75} ${2 * Math.PI * r}`}
          fill="none"
          transform={`rotate(-90 ${c} ${c})`}
        />
      </Svg>
      <Text
        style={{ color, fontSize: size * 0.42 }}
        className="absolute font-extrabold"
        allowFontScaling={false}>
        {(grade ?? '?').toUpperCase()}
      </Text>
    </View>
  );
}
