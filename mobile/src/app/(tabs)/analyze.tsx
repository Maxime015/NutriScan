import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, CheckCircle2, ChevronRight, ImageUp } from 'lucide-react-native';
import { Alert, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PressableScale } from '../../components/ui/PressableScale';
import { Screen } from '../../components/ui/Screen';
import { colors } from '../../lib/theme';

const TIPS = [
  'Assurez-vous que le texte est net et lisible',
  'Évitez les reflets et les zones floues',
  'Prenez la photo dans un bon éclairage',
];

export default function Analyze() {
  const router = useRouter();

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission requise', "Autorisez l'accès à la galerie pour importer une image.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!res.canceled && res.assets[0]) {
      router.push({ pathname: '/analysis/processing', params: { uri: res.assets[0].uri } });
    }
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}>
        {/* Bannière : assortiment d'aliments recouvert d'un effet liquid glass */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="rounded-3xl overflow-hidden mb-6 border border-border">
          {/* aspectRatio = ratio natif de hero.png (1536×1024) : l'image
              s'affiche entièrement, sans rognage. */}
          <View style={{ width: '100%', aspectRatio: 1536 / 1024 }}>
            <Image
              source={require('../../../assets/images/hero.png')}
              style={{ width: '100%', height: '100%' }}
              contentFit="contain"
            />
            {/* Léger voile en bas uniquement, pour la lisibilité du texte —
                l'image reste nette et visible. */}
            <LinearGradient
              colors={['transparent', 'rgba(9,20,14,0.55)']}
              locations={[0.45, 1]}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <View className="absolute bottom-0 left-0 right-0 p-4">
              <Text className="text-white text-xl font-extrabold">Analysez.</Text>
              <Text className="text-white text-xl font-extrabold">
                Mangez <Text style={{ color: '#4ADE80' }}>mieux.</Text>
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(60)}>
          <Text className="text-ink text-2xl font-extrabold">Analyser un aliment</Text>
          <Text className="text-muted text-base mt-1 mb-6">
            Choisissez une méthode pour analyser la liste d'ingrédients
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(80)}>
          <MethodCard
            title="Prendre une photo"
            subtitle="Capturez la liste d'ingrédients avec votre caméra"
            tint={colors.primary}
            icon={<Camera size={26} color={colors.primary} />}
            onPress={() => router.push('/analysis/camera')}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(160)} className="mt-4">
          <MethodCard
            title="Téléverser une image"
            subtitle="Importez une image depuis votre galerie"
            tint={colors.purple}
            icon={<ImageUp size={26} color={colors.purple} />}
            onPress={pickImage}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(240)}
          className="bg-surface/80 border border-border rounded-2xl p-5 mt-6">
          <Text className="text-ink font-bold text-base mb-4">
            Conseils pour de meilleurs résultats
          </Text>
          {TIPS.map((t) => (
            <View key={t} className="flex-row items-center gap-3 mb-3 last:mb-0">
              <CheckCircle2 size={18} color={colors.primary} />
              <Text className="text-muted flex-1">{t}</Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

function MethodCard({
  title,
  subtitle,
  tint,
  icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  tint: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <PressableScale onPress={onPress} scaleTo={0.98}>
      <View className="bg-surface/90 border border-border rounded-2xl p-5 flex-row items-center gap-4">
        <View
          className="w-14 h-14 rounded-2xl items-center justify-center"
          style={{ backgroundColor: `${tint}1f` }}>
          {icon}
        </View>
        <View className="flex-1">
          <Text className="text-ink font-bold text-base">{title}</Text>
          <Text className="text-muted text-sm mt-0.5 leading-5">{subtitle}</Text>
        </View>
        <ChevronRight size={22} color={colors.subtle} />
      </View>
    </PressableScale>
  );
}
