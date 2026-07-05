import { useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/** Bloc squelette avec pulsation douce (chargement élégant, adapté au thème). */
export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.85, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [opacity]);

  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View className={`bg-surface-3 rounded-lg ${className ?? ''}`} style={[anim, style]} />;
}

/** Squelette d'un élément d'historique (miroir de AnalysisListItem). */
export function AnalysisItemSkeleton() {
  return (
    <View className="bg-surface/90 border border-border rounded-2xl p-3 flex-row items-center gap-3">
      <Skeleton className="w-14 h-14 rounded-xl" />
      <View className="flex-1" style={{ gap: 8 }}>
        <Skeleton style={{ height: 13, width: '62%' }} />
        <Skeleton style={{ height: 10, width: '34%' }} />
        <Skeleton style={{ height: 10, width: '48%' }} />
      </View>
      <Skeleton className="w-10 h-10 rounded-full" />
    </View>
  );
}
