import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';

/**
 * Enregistre les composants tiers utilisés avec `className` auprès de NativeWind.
 * Sans ça, NativeWind ignore le `className` sur ces composants (ils ne sont pas
 * des primitives React Native mappées d'office), et les classes de mise en page
 * — ex. `px-5 py-4` sur le dégradé des boutons — sont silencieusement perdues.
 *
 * Importé une seule fois depuis le layout racine.
 */
cssInterop(LinearGradient, { className: 'style' });
