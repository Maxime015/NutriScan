import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Bell,
  Camera,
  FileText,
  Flame,
  Leaf,
  Lightbulb,
  Star,
  TrendingUp,
} from 'lucide-react-native';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { AnalysisListItem } from '../../components/AnalysisListItem';
import { PressableScale } from '../../components/ui/PressableScale';
import { Screen } from '../../components/ui/Screen';
import { StatCard } from '../../components/ui/StatCard';
import { useAuth } from '../../lib/auth';
import { useAnalyses, useStats } from '../../lib/queries';
import { colors, useColors } from '../../lib/theme';
import { TIPS } from '../../data/tips';

export default function Home() {
  const router = useRouter();
  const c = useColors();
  const { profile } = useAuth();
  const { data: analyses = [], isRefetching, refetch } = useAnalyses();
  const { stats } = useStats();
  const last = analyses[0];
  const tip = TIPS[0];

  const firstName = (profile?.full_name ?? '').split(' ')[0] || '';

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }>
        {/* En-tête */}
        <View className="flex-row items-center justify-between mb-5">
          <View className="flex-row items-center gap-2">
            <View className="w-9 h-9 rounded-xl bg-primary items-center justify-center">
              <Leaf size={20} color="#052e16" />
            </View>
            <Text className="text-ink text-xl font-extrabold">Accueil</Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-surface-2 items-center justify-center">
            <Bell size={20} color={c.ink} />
          </View>
        </View>

        {/* Hero */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <LinearGradient
            colors={c.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, overflow: 'hidden' }}
            className="p-6 border border-primary/20">
            <Animated.View
              entering={ZoomIn.springify().damping(14).delay(180)}
              style={{ position: 'absolute', right: -18, top: -6, bottom: -6, width: 172 }}>
              <Image
                source={require('../../../assets/images/list.png')}
                style={{ width: '100%', height: '100%' }}
                contentFit="contain"
              />
            </Animated.View>
            <View style={{ width: '54%' }}>
              <Text className="text-ink text-2xl font-extrabold leading-8">
                Analysez.{'\n'}Comprenez.{'\n'}
                <Text className="text-primary">Mangez mieux.</Text>
              </Text>
              <Text className="text-muted mt-3 leading-5">
                {firstName ? `Bonjour ${firstName} ! ` : ''}Prenez une photo de l'étiquette et
                découvrez son impact sur votre santé.
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* CTA */}
        <Animated.View entering={FadeInDown.duration(400).delay(80)} className="mt-4">
          <PressableScale onPress={() => router.push('/(tabs)/analyze')} scaleTo={0.98}>
            <LinearGradient
              colors={['#22C55E', '#16A34A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20 }}
              className="p-4 flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-2xl bg-black/15 items-center justify-center">
                <Camera size={26} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-extrabold text-base">Analyser un aliment</Text>
                <Text className="text-white/85 text-sm">Prenez une photo de l'étiquette</Text>
              </View>
            </LinearGradient>
          </PressableScale>
        </Animated.View>

        {/* Aperçu rapide */}
        <View className="flex-row items-center justify-between mt-7 mb-3">
          <Text className="text-ink text-lg font-bold">Aperçu rapide</Text>
          <Text
            className="text-primary font-semibold"
            onPress={() => router.push('/(tabs)/profile')}>
            Voir tout
          </Text>
        </View>
        <Animated.View entering={FadeInDown.duration(400).delay(160)} className="flex-row gap-3">
          <StatCard
            icon={<FileText size={18} color={colors.primary} />}
            value={stats.total}
            label="Analyses effectuées"
            tint={colors.primary}
          />
          <StatCard
            icon={<TrendingUp size={18} color={colors.info} />}
            value={stats.activeWeeks}
            label="Semaines actives"
            tint={colors.info}
          />
          <StatCard
            icon={<Star size={18} color={colors.warning} />}
            value={stats.goalsReached}
            label="Objectifs atteints"
            tint={colors.warning}
          />
          <StatCard
            icon={<Flame size={18} color={colors.purple} />}
            value={stats.streak}
            label="Jours de suite"
            tint={colors.purple}
          />
        </Animated.View>

        {/* Dernière analyse */}
        {last ? (
          <>
            <Text className="text-ink text-lg font-bold mt-7 mb-3">Dernière analyse</Text>
            <Animated.View entering={FadeInDown.duration(400).delay(240)}>
              <AnalysisListItem analysis={last} />
            </Animated.View>
          </>
        ) : null}

        {/* Conseil du jour */}
        <Animated.View entering={FadeInDown.duration(400).delay(320)} className="mt-7">
          <PressableScale onPress={() => router.push(`/tips/${tip.id}`)} scaleTo={0.98}>
            <View
              className="bg-primary/5 border border-primary/25 rounded-2xl p-5"
              style={{ overflow: 'hidden' }}>
              <Image
                source={require('../../../assets/images/salad.png')}
                style={{ position: 'absolute', right: -14, bottom: -14, width: 148, height: 126 }}
                contentFit="contain"
              />
              <View style={{ width: '64%' }}>
                <View className="flex-row items-center gap-2 mb-2">
                  <Lightbulb size={18} color={colors.primary} />
                  <Text className="text-primary font-bold">Conseil du jour</Text>
                </View>
                <Text className="text-ink font-semibold mb-1">{tip.title}</Text>
                <Text className="text-muted leading-5">{tip.summary}</Text>
              </View>
            </View>
          </PressableScale>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}
