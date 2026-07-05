import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ChevronRight,
  Dumbbell,
  Heart,
  Leaf,
  Lightbulb,
  Search,
  Shield,
} from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { PressableScale } from '../../components/ui/PressableScale';
import { Screen } from '../../components/ui/Screen';
import { TIP_CATEGORIES, TIPS, type Tip } from '../../data/tips';
import { colors, useColors } from '../../lib/theme';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  leaf: Leaf,
  heart: Heart,
  weight: Dumbbell,
  shield: Shield,
};

export default function Tips() {
  const router = useRouter();
  const tc = useColors();
  const [category, setCategory] = useState<string | null>(null);

  const list = category ? TIPS.filter((t) => t.category === category) : TIPS;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}>
        {/* En-tête */}
        <View className="flex-row items-center justify-between mb-5">
          <View className="flex-row items-center gap-2">
            <View className="w-9 h-9 rounded-xl bg-primary items-center justify-center">
              <Leaf size={20} color="#052e16" />
            </View>
            <Text className="text-ink text-xl font-extrabold">Conseils</Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-surface-2 items-center justify-center">
            <Search size={20} color={tc.ink} />
          </View>
        </View>

        {/* Hero */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <LinearGradient
            colors={tc.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, overflow: 'hidden' }}
            className="p-6 border border-primary/20">
            <Animated.View
              entering={ZoomIn.springify().damping(14).delay(180)}
              style={{ position: 'absolute', right: -20, top: -4, bottom: -4, width: 195 }}>
              <Image
                source={require('../../../assets/images/salad.png')}
                style={{ width: '100%', height: '100%' }}
                contentFit="contain"
              />
            </Animated.View>
            <View style={{ width: '54%' }}>
              <Text className="text-ink text-2xl font-extrabold">
                Mangez <Text className="text-primary">mieux</Text>,{'\n'}vivez{' '}
                <Text className="text-primary">mieux</Text> !
              </Text>
              <Text className="text-muted mt-2 leading-5">
                Des conseils simples pour des choix plus sains au quotidien.
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Catégories */}
        <Text className="text-ink text-lg font-bold mt-7 mb-3">Catégories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {TIP_CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICONS[c.icon];
              const active = category === c.key;
              return (
                <PressableScale
                  key={c.key}
                  scaleTo={0.95}
                  onPress={() => setCategory(active ? null : c.key)}>
                  <View
                    className="w-24 h-24 rounded-2xl items-center justify-center border"
                    style={{
                      backgroundColor: active ? `${c.color}20` : tc.surface,
                      borderColor: active ? c.color : tc.border,
                    }}>
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center mb-2"
                      style={{ backgroundColor: `${c.color}22` }}>
                      <Icon size={22} color={c.color} />
                    </View>
                    <Text className="text-ink text-[11px] text-center px-1" numberOfLines={2}>
                      {c.label}
                    </Text>
                  </View>
                </PressableScale>
              );
            })}
          </View>
        </ScrollView>

        {/* Conseils */}
        <Text className="text-ink text-lg font-bold mt-7 mb-3">
          {category ? 'Conseils filtrés' : 'Conseils recommandés'}
        </Text>
        <View className="gap-3">
          {list.map((tip, i) => (
            <Animated.View key={tip.id} entering={FadeInDown.duration(350).delay(i * 60)}>
              <TipCard tip={tip} onPress={() => router.push(`/tips/${tip.id}`)} />
            </Animated.View>
          ))}
        </View>

        {/* Rappel */}
        <View className="bg-primary/5 border border-primary/25 rounded-2xl p-5 mt-6 flex-row items-center gap-3">
          <Lightbulb size={22} color={colors.primary} />
          <View className="flex-1">
            <Text className="text-primary font-bold mb-0.5">Petit rappel</Text>
            <Text className="text-muted leading-5">
              De petits changements aujourd'hui, pour une grande différence demain.
            </Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function TipCard({ tip, onPress }: { tip: Tip; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} scaleTo={0.98}>
      <View className="bg-surface/90 border border-border rounded-2xl p-4 flex-row items-center gap-3">
        <View
          className="w-12 h-12 rounded-xl items-center justify-center"
          style={{ backgroundColor: `${tip.categoryColor}22` }}>
          <Lightbulb size={22} color={tip.categoryColor} />
        </View>
        <View className="flex-1">
          <Text style={{ color: tip.categoryColor }} className="text-xs font-semibold mb-0.5">
            {tip.categoryLabel}
          </Text>
          <Text className="text-ink font-bold leading-5" numberOfLines={2}>
            {tip.title}
          </Text>
          <Text className="text-muted text-xs mt-1 leading-4" numberOfLines={2}>
            {tip.summary}
          </Text>
        </View>
        <ChevronRight size={20} color={colors.subtle} />
      </View>
    </PressableScale>
  );
}
