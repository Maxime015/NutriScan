import { useRouter } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { useRef } from 'react';
import { Alert, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { useDeleteAnalysis } from '../lib/queries';
import type { AnalysisRow } from '../lib/types';
import { AnalysisListItem } from './AnalysisListItem';
import { PressableScale } from './ui/PressableScale';

/**
 * Élément d'historique avec suppression par balayage.
 * On empêche la navigation vers le détail quand un swipe a lieu (le geste
 * horizontal ne doit pas être interprété comme un tap), et un tap sur une ligne
 * déjà ouverte la referme au lieu de naviguer.
 */
export function SwipeableAnalysisItem({ analysis }: { analysis: AnalysisRow }) {
  const router = useRouter();
  const del = useDeleteAnalysis();

  const methodsRef = useRef<{ close: () => void } | null>(null);
  const swipedRef = useRef(false); // un drag horizontal vient de se produire
  const openRef = useRef(false); // la ligne est actuellement ouverte

  function confirmDelete() {
    Alert.alert(
      'Supprimer l’analyse',
      `Supprimer « ${analysis.product_name} » de votre historique ?`,
      [
        { text: 'Annuler', style: 'cancel', onPress: () => methodsRef.current?.close() },
        { text: 'Supprimer', style: 'destructive', onPress: () => del.mutate(analysis.id) },
      ]
    );
  }

  function handlePress() {
    // Un balayage vient d'avoir lieu → ne pas naviguer.
    if (swipedRef.current) {
      swipedRef.current = false;
      return;
    }
    // Ligne ouverte → la refermer au lieu d'ouvrir le détail.
    if (openRef.current) {
      methodsRef.current?.close();
      return;
    }
    router.push(`/analysis/${analysis.id}`);
  }

  return (
    <Swipeable
      renderRightActions={(_progress, _translation, methods) => {
        methodsRef.current = methods;
        return (
          <PressableScale onPress={confirmDelete} scaleTo={0.94} style={{ justifyContent: 'center' }}>
            <View
              className="bg-danger rounded-2xl items-center justify-center"
              style={{ width: 80, height: '100%', marginLeft: 10 }}>
              <Trash2 size={22} color="#ffffff" />
              <Text className="text-white text-xs font-semibold mt-1">Suppr.</Text>
            </View>
          </PressableScale>
        );
      }}
      rightThreshold={40}
      overshootRight={false}
      friction={2}
      onSwipeableOpenStartDrag={() => {
        swipedRef.current = true;
      }}
      onSwipeableCloseStartDrag={() => {
        swipedRef.current = true;
      }}
      onSwipeableWillOpen={() => {
        openRef.current = true;
      }}
      onSwipeableClose={() => {
        openRef.current = false;
      }}>
      <AnalysisListItem analysis={analysis} onPress={handlePress} />
    </Swipeable>
  );
}
