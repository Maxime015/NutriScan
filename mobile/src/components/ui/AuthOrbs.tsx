import { BlurView } from 'expo-blur';
import { Dimensions, View } from 'react-native';

import { useIsDark } from '../../lib/theme';
import { AnimatedOrb } from './AnimatedOrb';

const { width, height } = Dimensions.get('window');

/**
 * Arrière-plan des écrans d'authentification : orbes émeraude flottants,
 * adoucis par un voile de flou. Affiché uniquement en mode sombre.
 */
export function AuthOrbs() {
  const isDark = useIsDark();
  if (!isDark) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      <AnimatedOrb
        colors={['#22C55E', '#166534']}
        size={300}
        initialX={-80}
        initialY={height * 0.08}
        duration={4000}
      />
      <AnimatedOrb
        colors={['#16A34A', '#4ADE80']}
        size={250}
        initialX={width - 100}
        initialY={height * 0.28}
        duration={5000}
      />
      <AnimatedOrb
        colors={['#34D399', '#0F766E']}
        size={200}
        initialX={width * 0.3}
        initialY={height * 0.58}
        duration={3500}
      />
      <AnimatedOrb
        colors={['#4ADE80', '#14532D']}
        size={180}
        initialX={-50}
        initialY={height * 0.75}
        duration={4500}
      />
      <BlurView
        intensity={70}
        tint="dark"
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />
    </View>
  );
}
