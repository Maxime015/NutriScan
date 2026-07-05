import { useLocalSearchParams } from 'expo-router';
import { Lightbulb } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Header } from '../../components/ui/Header';
import { Screen } from '../../components/ui/Screen';
import { TIPS } from '../../data/tips';

export default function TipDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tip = TIPS.find((t) => t.id === id);

  return (
    <Screen>
      <Header title="Conseil" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        {!tip ? (
          <Text className="text-muted text-center mt-10">Conseil introuvable.</Text>
        ) : (
          <Animated.View entering={FadeInDown.duration(400)}>
            <View
              className="w-14 h-14 rounded-2xl items-center justify-center mb-4"
              style={{ backgroundColor: `${tip.categoryColor}22` }}>
              <Lightbulb size={28} color={tip.categoryColor} />
            </View>
            <Text style={{ color: tip.categoryColor }} className="font-semibold mb-1">
              {tip.categoryLabel}
            </Text>
            <Text className="text-ink text-2xl font-extrabold leading-8 mb-4">{tip.title}</Text>
            <Text className="text-muted text-base leading-7">{tip.body}</Text>
          </Animated.View>
        )}
      </ScrollView>
    </Screen>
  );
}
