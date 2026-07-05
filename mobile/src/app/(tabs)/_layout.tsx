import { NativeTabs } from 'expo-router/unstable-native-tabs';

// Tab bar native (liquid glass sur iOS 26). Volontairement simple, non personnalisé —
// seul l'accent (tintColor) suit l'identité de l'app.
export default function TabsLayout() {
  return (
    <NativeTabs tintColor="#22C55E">
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Accueil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="tips">
        <NativeTabs.Trigger.Label>Conseils</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'bell', selected: 'bell.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="analyze">
        <NativeTabs.Trigger.Label>Caméra</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'camera', selected: 'camera.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Label>Historique</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'clock', selected: 'clock.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
