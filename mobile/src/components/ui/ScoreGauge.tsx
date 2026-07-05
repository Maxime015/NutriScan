import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { formatConfidence } from '../../lib/format';
import { gradeColor, useColors } from '../../lib/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  grade: string;
  confidence: number;
  size?: number;
  /** Sous-libellé sous la lettre (défaut : "% confiance"). */
  subtitle?: string;
}

/**
 * Jauge circulaire animée du "Score de santé".
 * L'arc se remplit selon le grade (A rempli, E quasi vide) avec la couleur du grade.
 */
export function ScoreGauge({ grade, confidence, size = 200, subtitle }: Props) {
  const tc = useColors();
  const color = gradeColor(grade);
  const stroke = size * 0.075;
  const r = (size - stroke) / 2;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;

  const fillByGrade: Record<string, number> = { A: 0.95, B: 0.78, C: 0.55, D: 0.32, E: 0.12 };
  const target = fillByGrade[(grade ?? '').toUpperCase()] ?? 0.5;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(target, { duration: 1100, easing: Easing.out(Easing.cubic) });
  }, [target, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={r} stroke={tc.surface3} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={c}
          cy={c}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          fill="none"
          transform={`rotate(-90 ${c} ${c})`}
        />
      </Svg>
      <View className="absolute items-center">
        <Text style={{ color, fontSize: size * 0.34 }} className="font-extrabold" allowFontScaling={false}>
          {(grade ?? '?').toUpperCase()}
        </Text>
        <Text className="text-muted text-xs mt-1">
          {subtitle ?? `${formatConfidence(confidence)} confiance`}
        </Text>
      </View>
    </View>
  );
}
